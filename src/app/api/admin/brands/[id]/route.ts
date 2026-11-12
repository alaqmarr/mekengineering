import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { db, ensureDbReady } from "@/db";
import { brands } from "@/db/schema";
import { isAdminAuthenticated } from "@/auth";
import { slugify } from "@/lib/utils";

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
    const brandId = Number(id);
    const existing = await db
      .select()
      .from(brands)
      .where(eq(brands.id, brandId))
      .get();
    if (!existing) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    const body = await request.json();
    const patch: Partial<typeof brands.$inferInsert> = {
      updatedAt: new Date().toISOString(),
    };

    if ("name" in body && String(body.name).trim())
      patch.name = String(body.name).trim();
    if ("slug" in body && String(body.slug).trim()) {
      const base = slugify(String(body.slug));
      if (base) {
        const collision = await db
          .select()
          .from(brands)
          .where(and(eq(brands.slug, base), ne(brands.id, brandId)))
          .get();
        patch.slug = collision ? `${base}-${brandId}` : base;
      }
    }
    if ("tagline" in body) patch.tagline = String(body.tagline ?? "");
    if ("description" in body) patch.description = String(body.description ?? "");
    if ("logoUrl" in body) patch.logoUrl = String(body.logoUrl ?? "");
    if ("bannerUrl" in body) patch.bannerUrl = String(body.bannerUrl ?? "");
    if ("websiteUrl" in body) patch.websiteUrl = String(body.websiteUrl ?? "");
    if ("authorizedSince" in body)
      patch.authorizedSince = String(body.authorizedSince ?? "");
    if ("rating" in body)
      patch.rating = Math.min(5, Math.max(1, Number(body.rating || 5)));
    if ("featured" in body) patch.featured = Boolean(body.featured);
    if ("sortOrder" in body) patch.sortOrder = Number(body.sortOrder || 0);
    if ("metaTitle" in body) patch.metaTitle = String(body.metaTitle ?? "");
    if ("metaDescription" in body)
      patch.metaDescription = String(body.metaDescription ?? "");
    if ("ogImage" in body) patch.ogImage = String(body.ogImage ?? "");

    const updated = await db
      .update(brands)
      .set(patch)
      .where(eq(brands.id, brandId))
      .returning()
      .get();

    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true, item: updated });
  } catch (err) {
    console.error("[Admin Brands PATCH]", err);
    return NextResponse.json(
      { error: "Failed to update brand" },
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
  await db.delete(brands).where(eq(brands.id, Number(id))).run();
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
