import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ensureDbReady, libsql } from "@/db";
import { isAdminAuthenticated } from "@/auth";

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureDbReady();
    const body = await request.json();
    const now = new Date().toISOString();

    const sql = `
      INSERT INTO site_content (key, value, type, label, section, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = excluded.updated_at
    `;

    if (Array.isArray(body.updates)) {
      const statements = body.updates
        .filter((item: { key?: string }) => Boolean(item?.key))
        .map(
          (item: {
            key: string;
            value: string;
            type?: string;
            label?: string;
            section?: string;
          }) => ({
            sql,
            args: [
              String(item.key),
              String(item.value ?? ""),
              item.type || "text",
              item.label || String(item.key),
              item.section || "global",
              now,
            ],
          })
        );
      if (statements.length > 0) {
        await libsql.batch(statements, "write");
      }
    } else if (body.key) {
      await libsql.execute({
        sql,
        args: [
          String(body.key),
          String(body.value ?? ""),
          body.type || "text",
          body.label || String(body.key),
          body.section || "global",
          now,
        ],
      });
    } else {
      return NextResponse.json(
        { error: "Missing key or updates array" },
        { status: 400 }
      );
    }

    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true, updatedAt: now });
  } catch (err) {
    console.error("[CMS Content PATCH]", err);
    return NextResponse.json(
      { error: "Failed to save content" },
      { status: 500 }
    );
  }
}
