import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, ensureDbReady } from "@/db";
import { products } from "@/db/schema";
import { isAdminAuthenticated } from "@/auth";
import { getEnrichedProducts } from "@/db/queries";
import { slugify } from "@/lib/utils";

async function makeUniqueProductSlug(
  baseName: string,
  requestedSlug?: string
): Promise<string> {
  const base = slugify(requestedSlug || baseName) || `product-${Date.now()}`;
  let candidate = base;
  let counter = 2;
  while (
    await db
      .select()
      .from(products)
      .where(eq(products.slug, candidate))
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
  return NextResponse.json({ items: await getEnrichedProducts() });
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
        { error: "Product name is required" },
        { status: 400 }
      );
    }

    const slug = await makeUniqueProductSlug(name, body.slug);
    const now = new Date().toISOString();

    const inserted = await db
      .insert(products)
      .values({
        name,
        slug,
        sku: String(body.sku || "").trim(),
        modelNumber: String(body.modelNumber || "").trim(),
        shortDescription: String(body.shortDescription || "").trim(),
        description: String(body.description || "").trim(),
        priceText: String(body.priceText || "Request Wholesale Quote").trim(),
        inStock: body.inStock !== false,
        featured: Boolean(body.featured),
        badge: String(body.badge || "").trim(),
        categoryId: body.categoryId ? Number(body.categoryId) : null,
        subcategoryId: body.subcategoryId ? Number(body.subcategoryId) : null,
        brandId: body.brandId ? Number(body.brandId) : null,
        imageUrl: String(
          body.imageUrl || "/images/carousel/store-interior.png"
        ).trim(),
        galleryJson:
          typeof body.galleryJson === "string"
            ? body.galleryJson
            : JSON.stringify(Array.isArray(body.gallery) ? body.gallery : []),
        specsJson:
          typeof body.specsJson === "string"
            ? body.specsJson
            : JSON.stringify(Array.isArray(body.specs) ? body.specs : []),
        featuresJson:
          typeof body.featuresJson === "string"
            ? body.featuresJson
            : JSON.stringify(Array.isArray(body.features) ? body.features : []),
        datasheetUrl: String(body.datasheetUrl || "").trim(),
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
    console.error("[Admin Products POST]", err);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
