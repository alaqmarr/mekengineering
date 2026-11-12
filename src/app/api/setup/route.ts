import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db, ensureDbReady } from "@/db";
import { users } from "@/db/schema";
import { hasAdminAccount, upsertSystemSecrets } from "@/db/queries";
import { CLOUDFLARE_ONE_CLICK_TOKEN_URL, oneClickConnectCloudflareR2 } from "@/lib/r2";

export async function GET() {
  return NextResponse.json({
    setupCompleted: await hasAdminAccount(),
    oneClickTokenUrl: CLOUDFLARE_ONE_CLICK_TOKEN_URL,
  });
}

export async function POST(request: Request) {
  try {
    await ensureDbReady();
    if (await hasAdminAccount()) {
      return NextResponse.json(
        { error: "Initial setup is already completed. Admin account exists." },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Support One-Click R2 verification preview right inside /setup before creating admin
    if (body.action === "preview-one-click-r2") {
      const result = await oneClickConnectCloudflareR2({
        apiToken: String(body.apiToken || ""),
        accountId: body.accountId ? String(body.accountId) : undefined,
        bucketName: body.bucketName ? String(body.bucketName) : undefined,
      });
      return NextResponse.json(result, {
        status:
          result.ok || result.needsBucketSelection || result.needsAccountSelection
            ? 200
            : 400,
      });
    }

    const name = String(body.name || "").trim();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const password = String(body.password || "");

    if (!name || !email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please provide a valid name and email address." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const now = new Date().toISOString();

    await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash,
        role: "admin",
        createdAt: now,
        updatedAt: now,
      })
      .run();

    // Optionally save R2 (Slot 1 & Slot 2) / Nodemailer credentials if provided during /setup
    if (body.integrations && typeof body.integrations === "object") {
      const secretsToSave: Record<string, string> = {};
      const allowedKeys = [
        "r2.enabled",
        "r2.verified",
        "r2.accountId",
        "r2.accountName",
        "r2.accessKeyId",
        "r2.secretAccessKey",
        "r2.bucketName",
        "r2.publicUrl",
        "r2.apiToken",
        "r2_2.enabled",
        "r2_2.verified",
        "r2_2.accountId",
        "r2_2.accountName",
        "r2_2.accessKeyId",
        "r2_2.secretAccessKey",
        "r2_2.bucketName",
        "r2_2.publicUrl",
        "r2_2.apiToken",
        "smtp.host",
        "smtp.port",
        "smtp.secure",
        "smtp.user",
        "smtp.pass",
        "smtp.fromName",
        "smtp.fromEmail",
        "smtp.adminEmail",
      ];
      for (const k of allowedKeys) {
        const val = body.integrations[k];
        if (typeof val === "string" && val.trim() !== "") {
          secretsToSave[k] = val.trim();
        }
      }
      if (Object.keys(secretsToSave).length > 0) {
        await upsertSystemSecrets(secretsToSave);
      }
    }

    return NextResponse.json({
      ok: true,
      message: "First admin account created successfully.",
    });
  } catch (err) {
    console.error("[Setup API]", err);
    return NextResponse.json(
      { error: "Failed to complete setup." },
      { status: 500 }
    );
  }
}
