import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, ensureDbReady } from "@/db";
import { subcategories } from "@/db/schema";
import { isAdminAuthenticated } from "@/auth";
import { getAllSubcategoriesWithDetails } from "@/db/queries";
import { slugify } from "@/lib/utils";

async function makeUniqueSubcategorySlug(
  name: string,
  requestedSlug?: string
): Promise<string> {
  const base = slugify(requestedSlug || name) || `subcategory-${Date.now()}`;
  let candidate = base;
  let counter = 2;
  while (
    await db
      .select()
      .from(subcategories)
      .where(eq(subcategories.slug, candidate))
      .get()
  ) {
    candidate = `${base}-${counter++}`;
  }
  return candidate;
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ items: await getAllSubcategoriesWithDetails() });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureDbReady();
    const body = await request.json();
    const name = String(body.name || "").trim();
    const categoryId = Number(body.categoryId || 0);
    if (!name || !categoryId) {
      return NextResponse.json(
        { error: "Subcategory name and parent category are required" },
        { status: 400 }
      );
    }

    const slug = await makeUniqueSubcategorySlug(name, body.slug);
    const now = new Date().toISOString();

    const inserted = await db
      .insert(subcategories)
      .values({
        categoryId,
        name,
        slug,
        shortDescription: String(body.shortDescription || "").trim(),
        description: String(body.description || "").trim(),
        imageUrl: String(
          body.imageUrl || "/images/carousel/dewalt-site.png"
        ).trim(),
        featured: body.featured !== false,
        sortOrder: Number(body.sortOrder || 0),
        metaTitle: String(body.metaTitle || "").trim(),
        metaDescription: String(body.metaDescription || "").trim(),
        ogImage: String(body.ogImage || "").trim(),
        createdAt: now,
        updatedAt: now,
      })
      .returning()
      .get();

    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true, item: inserted });
  } catch (err) {
    console.error("[Admin Subcategories POST]", err);
    return NextResponse.json(
      { error: "Failed to create subcategory" },
      { status: 500 }
    );
  }
}
