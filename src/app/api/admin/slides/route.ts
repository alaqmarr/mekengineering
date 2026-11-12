import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db, ensureDbReady } from "@/db";
import { heroSlides } from "@/db/schema";
import { isAdminAuthenticated } from "@/auth";
import { getHeroSlides } from "@/db/queries";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ items: await getHeroSlides(true) });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureDbReady();
    const body = await request.json();
    const now = new Date().toISOString();

    const inserted = await db
      .insert(heroSlides)
      .values({
        badge: String(body.badge || "Premium Industrial Supply"),
        titlePart1: String(body.titlePart1 || ""),
        titleHighlight: String(body.titleHighlight || "INDUSTRIAL"),
        titlePart2: String(body.titlePart2 || "SUPPLY"),
        subtitle: String(body.subtitle || ""),
        primaryCtaText: String(body.primaryCtaText || "View Catalog"),
        primaryCtaHref: String(body.primaryCtaHref || "/products"),
        secondaryCtaText: String(body.secondaryCtaText || "Contact Us"),
        secondaryCtaHref: String(body.secondaryCtaHref || "/contact"),
        imageUrl: String(body.imageUrl || "/images/carousel/store-interior.png"),
        sortOrder: Number(body.sortOrder || 0),
        isActive: body.isActive !== false,
        createdAt: now,
        updatedAt: now,
      })
      .returning()
      .get();

    revalidatePath("/");
    return NextResponse.json({ ok: true, item: inserted });
  } catch (err) {
    console.error("[Admin Slides POST]", err);
    return NextResponse.json({ error: "Failed to add slide" }, { status: 500 });
  }
}
