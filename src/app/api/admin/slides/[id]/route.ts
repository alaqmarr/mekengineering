import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, ensureDbReady } from "@/db";
import { heroSlides } from "@/db/schema";
import { isAdminAuthenticated } from "@/auth";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureDbReady();
    const { id } = await context.params;
    const slideId = Number(id);
    const body = await request.json();
    const patch: Partial<typeof heroSlides.$inferInsert> = {
      updatedAt: new Date().toISOString(),
    };

    if ("badge" in body) patch.badge = String(body.badge ?? "");
    if ("titlePart1" in body) patch.titlePart1 = String(body.titlePart1 ?? "");
    if ("titleHighlight" in body)
      patch.titleHighlight = String(body.titleHighlight ?? "");
    if ("titlePart2" in body) patch.titlePart2 = String(body.titlePart2 ?? "");
    if ("subtitle" in body) patch.subtitle = String(body.subtitle ?? "");
    if ("primaryCtaText" in body)
      patch.primaryCtaText = String(body.primaryCtaText ?? "");
    if ("primaryCtaHref" in body)
      patch.primaryCtaHref = String(body.primaryCtaHref ?? "");
    if ("secondaryCtaText" in body)
      patch.secondaryCtaText = String(body.secondaryCtaText ?? "");
    if ("secondaryCtaHref" in body)
      patch.secondaryCtaHref = String(body.secondaryCtaHref ?? "");
    if ("imageUrl" in body) patch.imageUrl = String(body.imageUrl ?? "");
    if ("sortOrder" in body) patch.sortOrder = Number(body.sortOrder || 0);
    if ("isActive" in body) patch.isActive = Boolean(body.isActive);

    const updated = await db
      .update(heroSlides)
      .set(patch)
      .where(eq(heroSlides.id, slideId))
      .returning()
      .get();

    revalidatePath("/");
    return NextResponse.json({ ok: true, item: updated });
  } catch (err) {
    console.error("[Admin Slides PATCH]", err);
    return NextResponse.json(
      { error: "Failed to update slide" },
      { status: 500 }
    );
  }
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
  await db.delete(heroSlides).where(eq(heroSlides.id, Number(id))).run();
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
