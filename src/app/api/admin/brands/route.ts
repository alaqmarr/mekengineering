import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, ensureDbReady } from "@/db";
import { brands } from "@/db/schema";
import { isAdminAuthenticated } from "@/auth";
import { getAllBrandsWithCounts } from "@/db/queries";
import { slugify } from "@/lib/utils";

async function makeUniqueBrandSlug(
  name: string,
  requestedSlug?: string
): Promise<string> {
  const base = slugify(requestedSlug || name) || `brand-${Date.now()}`;
  let candidate = base;
  let counter = 2;
  while (
    await db.select().from(brands).where(eq(brands.slug, candidate)).get()
  ) {
    candidate = `${base}-${counter++}`;
  }
  return candidate;
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ items: await getAllBrandsWithCounts() });
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
        { error: "Brand name is required" },
        { status: 400 }
      );
    }

    const slug = await makeUniqueBrandSlug(name, body.slug);
    const now = new Date().toISOString();

    const inserted = await db
      .insert(brands)
      .values({
        name,
        slug,
        tagline: String(body.tagline || "Authorized Industrial Partner").trim(),
        description: String(body.description || "").trim(),
        logoUrl: String(body.logoUrl || "").trim(),
        bannerUrl: String(
          body.bannerUrl || "/images/carousel/bosch-store.png"
        ).trim(),
        websiteUrl: String(body.websiteUrl || "").trim(),
        authorizedSince: String(body.authorizedSince || "1968").trim(),
        rating: Math.min(5, Math.max(1, Number(body.rating || 5))),
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
    console.error("[Admin Brands POST]", err);
    return NextResponse.json(
      { error: "Failed to create brand" },
      { status: 500 }
    );
  }
}
