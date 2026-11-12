import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { db, ensureDbReady } from "@/db";
import { subcategories } from "@/db/schema";
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
    const subId = Number(id);
    const existing = await db
      .select()
      .from(subcategories)
      .where(eq(subcategories.id, subId))
      .get();
    if (!existing) {
      return NextResponse.json(
        { error: "Subcategory not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const patch: Partial<typeof subcategories.$inferInsert> = {
      updatedAt: new Date().toISOString(),
    };

    if ("categoryId" in body && Number(body.categoryId)) {
      patch.categoryId = Number(body.categoryId);
    }
    if ("name" in body && String(body.name).trim())
      patch.name = String(body.name).trim();
    if ("slug" in body && String(body.slug).trim()) {
      const base = slugify(String(body.slug));
      if (base) {
        const collision = await db
          .select()
          .from(subcategories)
          .where(and(eq(subcategories.slug, base), ne(subcategories.id, subId)))
          .get();
        patch.slug = collision ? `${base}-${subId}` : base;
      }
    }
    if ("shortDescription" in body)
      patch.shortDescription = String(body.shortDescription ?? "");
    if ("description" in body) patch.description = String(body.description ?? "");
    if ("imageUrl" in body) patch.imageUrl = String(body.imageUrl ?? "");
    if ("featured" in body) patch.featured = Boolean(body.featured);
    if ("sortOrder" in body) patch.sortOrder = Number(body.sortOrder || 0);
    if ("metaTitle" in body) patch.metaTitle = String(body.metaTitle ?? "");
    if ("metaDescription" in body)
      patch.metaDescription = String(body.metaDescription ?? "");
    if ("ogImage" in body) patch.ogImage = String(body.ogImage ?? "");

    const updated = await db
      .update(subcategories)
      .set(patch)
      .where(eq(subcategories.id, subId))
      .returning()
      .get();

    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true, item: updated });
  } catch (err) {
    console.error("[Admin Subcategories PATCH]", err);
    return NextResponse.json(
      { error: "Failed to update subcategory" },
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
  await db.delete(subcategories).where(eq(subcategories.id, Number(id))).run();
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
