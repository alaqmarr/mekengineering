import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getSafeSession, isAdminAuthenticated } from "@/auth";
import { db, ensureDbReady } from "@/db";
import { users } from "@/db/schema";
import {
  getIntegrationCredentials,
  upsertSystemSecrets,
} from "@/db/queries";
import {
  oneClickConnectCloudflareR2,
  testR2Connection,
  verifyActivePreSetupBucket,
} from "@/lib/r2";
import {
  buildMaskedIntegrationsResponse,
  SECRET_MASK as MASK,
} from "@/lib/integrations";
import { sendTestSmtpEmail } from "@/lib/mailer";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(await buildMaskedIntegrationsResponse());
}

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updates: Record<string, string> = {};

    if (body.smtp && typeof body.smtp === "object") {
      if (typeof body.smtp.host === "string")
        updates["smtp.host"] = body.smtp.host.trim();
      if (typeof body.smtp.port === "string" || typeof body.smtp.port === "number") {
        updates["smtp.port"] = String(body.smtp.port).trim();
      }
      if (typeof body.smtp.secure === "boolean") {
        updates["smtp.secure"] = body.smtp.secure ? "true" : "false";
      }
      if (typeof body.smtp.user === "string")
        updates["smtp.user"] = body.smtp.user.trim();
      if (
        typeof body.smtp.pass === "string" &&
        body.smtp.pass !== MASK &&
        body.smtp.pass.trim() !== ""
      ) {
        updates["smtp.pass"] = body.smtp.pass.trim();
      } else if (body.smtp.clearPass === true) {
        updates["smtp.pass"] = "";
      }
      if (typeof body.smtp.fromName === "string")
        updates["smtp.fromName"] = body.smtp.fromName.trim();
      if (typeof body.smtp.fromEmail === "string")
        updates["smtp.fromEmail"] = body.smtp.fromEmail.trim();
      if (typeof body.smtp.adminEmail === "string")
        updates["smtp.adminEmail"] = body.smtp.adminEmail.trim();
    }

    if (Object.keys(updates).length > 0) {
      await upsertSystemSecrets(updates);
    }

    return NextResponse.json({
      ok: true,
      message: "Credentials saved securely in database.",
      data: await buildMaskedIntegrationsResponse(),
    });
  } catch (err) {
    console.error("[Integrations PATCH]", err);
    return NextResponse.json(
      { error: "Failed to save credentials" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureDbReady();
    const body = await request.json();
    const action = String(body.action || "");

    // 1. One-Click Cloudflare Connect (supports Slot 1 & Slot 2; requires pre-setup active bucket)
    if (action === "one-click-r2") {
      const slot: 1 | 2 = Number(body.slot) === 2 ? 2 : 1;
      const prefix = slot === 1 ? "r2" : "r2_2";
      const creds = await getIntegrationCredentials();
      const existing = creds.r2Connections[slot - 1];

      const rawToken = String(body.apiToken || "").trim();
      const apiToken =
        rawToken && rawToken !== MASK ? rawToken : existing.apiToken;

      const result = await oneClickConnectCloudflareR2({
        apiToken,
        accountId: body.accountId ? String(body.accountId).trim() : undefined,
        bucketName: body.bucketName ? String(body.bucketName).trim() : undefined,
        publicUrl: body.publicUrl ? String(body.publicUrl).trim() : undefined,
      });

      if (!result.ok) {
        return NextResponse.json(result, {
          status:
            result.needsBucketSelection || result.needsAccountSelection
              ? 200
              : 400,
        });
      }

      await upsertSystemSecrets({
        [`${prefix}.enabled`]: "true",
        [`${prefix}.verified`]: "true",
        [`${prefix}.accountId`]: result.accountId || "",
        [`${prefix}.accountName`]: result.accountName || "",
        [`${prefix}.bucketName`]: result.bucketName || "",
        [`${prefix}.accessKeyId`]: result.accessKeyId || "",
        [`${prefix}.secretAccessKey`]: result.secretAccessKey || "",
        [`${prefix}.publicUrl`]: result.publicUrl || "",
        [`${prefix}.apiToken`]: apiToken,
      });

      return NextResponse.json({
        ...result,
        slot,
        data: await buildMaskedIntegrationsResponse(),
      });
    }

    // 2. Manual S3 Connection Save + Mandatory Active Pre-Setup Bucket Verification
    if (action === "save-manual-r2") {
      const slot: 1 | 2 = Number(body.slot) === 2 ? 2 : 1;
      const prefix = slot === 1 ? "r2" : "r2_2";
      const creds = await getIntegrationCredentials();
      const existing = creds.r2Connections[slot - 1];

      const accountId = String(body.accountId ?? existing.accountId).trim();
      const accessKeyId = String(body.accessKeyId ?? existing.accessKeyId).trim();
      const rawSecret = String(body.secretAccessKey ?? "").trim();
      const secretAccessKey =
        rawSecret && rawSecret !== MASK ? rawSecret : existing.secretAccessKey;
      const bucketName = String(body.bucketName ?? existing.bucketName).trim();
      const publicUrl = String(body.publicUrl ?? existing.publicUrl)
        .trim()
        .replace(/\/$/, "");
      const enabled = body.enabled !== false;

      // Enforce that the user ALREADY has an active pre-setup bucket before succeeding
      const verification = await verifyActivePreSetupBucket({
        accountId,
        accessKeyId,
        secretAccessKey,
        bucketName,
      });

      if (!verification.ok) {
        await upsertSystemSecrets({
          [`${prefix}.verified`]: "false",
        });
        return NextResponse.json(
          {
            ok: false,
            message: verification.message,
          },
          { status: 400 }
        );
      }

      await upsertSystemSecrets({
        [`${prefix}.enabled`]: enabled ? "true" : "false",
        [`${prefix}.verified`]: "true",
        [`${prefix}.accountId`]: accountId,
        [`${prefix}.accessKeyId`]: accessKeyId,
        [`${prefix}.secretAccessKey`]: secretAccessKey,
        [`${prefix}.bucketName`]: bucketName,
        [`${prefix}.publicUrl`]: publicUrl,
      });

      return NextResponse.json({
        ok: true,
        slot,
        message: `Connection #${slot} verified & connected to active bucket "${bucketName}".`,
        data: await buildMaskedIntegrationsResponse(),
      });
    }

    // 3. Toggle R2 Slot Active in Random Upload Pool
    if (action === "toggle-r2-slot") {
      const slot: 1 | 2 = Number(body.slot) === 2 ? 2 : 1;
      const prefix = slot === 1 ? "r2" : "r2_2";
      const enabled = Boolean(body.enabled);
      await upsertSystemSecrets({
        [`${prefix}.enabled`]: enabled ? "true" : "false",
      });
      return NextResponse.json({
        ok: true,
        message: `Connection #${slot} ${enabled ? "enabled in" : "paused from"} random upload pool.`,
        data: await buildMaskedIntegrationsResponse(),
      });
    }

    // 4. Disconnect R2 Slot
    if (action === "disconnect-r2") {
      const slot: 1 | 2 = Number(body.slot) === 2 ? 2 : 1;
      const prefix = slot === 1 ? "r2" : "r2_2";
      await upsertSystemSecrets({
        [`${prefix}.enabled`]: "true",
        [`${prefix}.verified`]: "false",
        [`${prefix}.accountId`]: "",
        [`${prefix}.accountName`]: "",
        [`${prefix}.accessKeyId`]: "",
        [`${prefix}.secretAccessKey`]: "",
        [`${prefix}.bucketName`]: "",
        [`${prefix}.publicUrl`]: "",
        [`${prefix}.apiToken`]: "",
      });
      return NextResponse.json({
        ok: true,
        message: `Cloudflare R2 Connection #${slot} disconnected.`,
        data: await buildMaskedIntegrationsResponse(),
      });
    }

    // 5. Test Active R2 Bucket(s)
    if (action === "test-r2") {
      const slot =
        Number(body.slot) === 1 ? 1 : Number(body.slot) === 2 ? 2 : undefined;
      const res = await testR2Connection(slot);
      if (slot) {
        const prefix = slot === 1 ? "r2" : "r2_2";
        await upsertSystemSecrets({
          [`${prefix}.verified`]: res.ok ? "true" : "false",
        });
      }
      return NextResponse.json(
        { ...res, data: await buildMaskedIntegrationsResponse() },
        { status: res.ok ? 200 : 400 }
      );
    }

    // 6. Test Gmail SMTP
    if (action === "test-smtp") {
      const res = await sendTestSmtpEmail(body.recipientEmail);
      return NextResponse.json(res, { status: res.ok ? 200 : 400 });
    }

    // 7. Change Admin Password
    if (action === "change-password") {
      const session = await getSafeSession();
      const userId = Number(session?.user?.id || 0);
      const currentPassword = String(body.currentPassword || "");
      const newPassword = String(body.newPassword || "");

      if (!userId || newPassword.length < 8) {
        return NextResponse.json(
          { ok: false, message: "New password must be at least 8 characters." },
          { status: 400 }
        );
      }

      const admin = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .get();
      if (!admin) {
        return NextResponse.json(
          { ok: false, message: "Admin user not found." },
          { status: 404 }
        );
      }

      const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
      if (!valid) {
        return NextResponse.json(
          { ok: false, message: "Current password is incorrect." },
          { status: 400 }
        );
      }

      const passwordHash = await bcrypt.hash(newPassword, 12);
      await db
        .update(users)
        .set({ passwordHash, updatedAt: new Date().toISOString() })
        .where(eq(users.id, userId))
        .run();

      return NextResponse.json({
        ok: true,
        message: "Admin password updated successfully.",
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("[Integrations POST]", err);
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}
