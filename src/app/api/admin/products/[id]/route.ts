import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { db, ensureDbReady } from "@/db";
import { products } from "@/db/schema";
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
    const productId = Number(id);
    const existing = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .get();
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const body = await request.json();
    const patch: Partial<typeof products.$inferInsert> = {
      updatedAt: new Date().toISOString(),
    };

    if ("name" in body && String(body.name).trim())
      patch.name = String(body.name).trim();
    if ("slug" in body && String(body.slug).trim()) {
      const base = slugify(String(body.slug));
      if (base) {
        const collision = await db
          .select()
          .from(products)
          .where(and(eq(products.slug, base), ne(products.id, productId)))
          .get();
        patch.slug = collision ? `${base}-${productId}` : base;
      }
    }
    if ("sku" in body) patch.sku = String(body.sku ?? "").trim();
    if ("modelNumber" in body)
      patch.modelNumber = String(body.modelNumber ?? "").trim();
    if ("shortDescription" in body)
      patch.shortDescription = String(body.shortDescription ?? "");
    if ("description" in body) patch.description = String(body.description ?? "");
    if ("priceText" in body) patch.priceText = String(body.priceText ?? "");
    if ("inStock" in body) patch.inStock = Boolean(body.inStock);
    if ("featured" in body) patch.featured = Boolean(body.featured);
    if ("badge" in body) patch.badge = String(body.badge ?? "");
    if ("categoryId" in body)
      patch.categoryId = body.categoryId ? Number(body.categoryId) : null;
    if ("subcategoryId" in body)
      patch.subcategoryId = body.subcategoryId
        ? Number(body.subcategoryId)
        : null;
    if ("brandId" in body)
      patch.brandId = body.brandId ? Number(body.brandId) : null;
    if ("imageUrl" in body) patch.imageUrl = String(body.imageUrl ?? "");
    if ("galleryJson" in body)
      patch.galleryJson = String(body.galleryJson ?? "[]");
    if ("gallery" in body && Array.isArray(body.gallery))
      patch.galleryJson = JSON.stringify(body.gallery);
    if ("specsJson" in body) patch.specsJson = String(body.specsJson ?? "[]");
    if ("specs" in body && Array.isArray(body.specs))
      patch.specsJson = JSON.stringify(body.specs);
    if ("featuresJson" in body)
      patch.featuresJson = String(body.featuresJson ?? "[]");
    if ("features" in body && Array.isArray(body.features))
      patch.featuresJson = JSON.stringify(body.features);
    if ("datasheetUrl" in body)
      patch.datasheetUrl = String(body.datasheetUrl ?? "");
    if ("sortOrder" in body) patch.sortOrder = Number(body.sortOrder || 0);
    if ("metaTitle" in body) patch.metaTitle = String(body.metaTitle ?? "");
    if ("metaDescription" in body)
      patch.metaDescription = String(body.metaDescription ?? "");
    if ("ogImage" in body) patch.ogImage = String(body.ogImage ?? "");

    const updated = await db
      .update(products)
      .set(patch)
      .where(eq(products.id, productId))
      .returning()
      .get();

    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true, item: updated });
  } catch (err) {
    console.error("[Admin Products PATCH]", err);
    return NextResponse.json(
      { error: "Failed to update product" },
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
  await db.delete(products).where(eq(products.id, Number(id))).run();
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
