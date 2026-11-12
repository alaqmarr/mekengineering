import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, ensureDbReady } from "@/db";
import { inquiries } from "@/db/schema";
import { isAdminAuthenticated } from "@/auth";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureDbReady();
  const { id } = await context.params;
  const body = await request.json();
  const status = String(body.status || "read");

  await db
    .update(inquiries)
    .set({ status })
    .where(eq(inquiries.id, Number(id)))
    .run();

  revalidatePath("/admin");
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureDbReady();
  const { id } = await context.params;
  await db.delete(inquiries).where(eq(inquiries.id, Number(id))).run();
  revalidatePath("/admin");
  return NextResponse.json({ ok: true });
}
