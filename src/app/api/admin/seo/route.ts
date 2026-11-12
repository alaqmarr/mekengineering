import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ensureDbReady, libsql } from "@/db";
import { isAdminAuthenticated } from "@/auth";
import { getAllPageSeo } from "@/db/queries";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ items: await getAllPageSeo() });
}

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureDbReady();
    const body = await request.json();
    const route = String(body.route || "").trim();
    if (!route) {
      return NextResponse.json({ error: "Route is required" }, { status: 400 });
    }

    const now = new Date().toISOString();
    await libsql.execute({
      sql: `
        INSERT INTO page_seo (route, title, description, keywords, og_title, og_description, og_image, canonical_url, no_index, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(route) DO UPDATE SET
          title = excluded.title,
          description = excluded.description,
          keywords = excluded.keywords,
          og_title = excluded.og_title,
          og_description = excluded.og_description,
          og_image = excluded.og_image,
          canonical_url = excluded.canonical_url,
          no_index = excluded.no_index,
          updated_at = excluded.updated_at
      `,
      args: [
        route,
        String(body.title || ""),
        String(body.description || ""),
        String(body.keywords || ""),
        String(body.ogTitle || ""),
        String(body.ogDescription || ""),
        String(body.ogImage || "/images/carousel/store-interior.png"),
        String(body.canonicalUrl || ""),
        body.noIndex ? 1 : 0,
        now,
      ],
    });

    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Admin SEO PATCH]", err);
    return NextResponse.json(
      { error: "Failed to save SEO settings" },
      { status: 500 }
    );
  }
}
