import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, ensureDbReady } from "@/db";
import { categories } from "@/db/schema";
import { isAdminAuthenticated } from "@/auth";
import { getAllCategoriesWithCounts } from "@/db/queries";
import { slugify } from "@/lib/utils";

async function makeUniqueCategorySlug(
  name: string,
  requestedSlug?: string
): Promise<string> {
  const base = slugify(requestedSlug || name) || `category-${Date.now()}`;
  let candidate = base;
  let counter = 2;
  while (
    await db
      .select()
      .from(categories)
      .where(eq(categories.slug, candidate))
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
  return NextResponse.json({ items: await getAllCategoriesWithCounts() });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureDbReady();
    const body = await request.json();
    const name = String(body.name || "").trim();
    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    const slug = await makeUniqueCategorySlug(name, body.slug);
    const now = new Date().toISOString();

    const inserted = await db
      .insert(categories)
      .values({
        name,
        slug,
        badge: String(body.badge || "Industrial Line").trim(),
        shortDescription: String(body.shortDescription || "").trim(),
        description: String(body.description || "").trim(),
        imageUrl: String(
          body.imageUrl || "/images/carousel/store-interior.png"
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
    console.error("[Admin Categories POST]", err);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
