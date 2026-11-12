import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, ensureDbReady } from "@/db";
import { inquiries } from "@/db/schema";
import { sendInquiryNotificationEmails } from "@/lib/mailer";

export async function POST(request: Request) {
  try {
    await ensureDbReady();
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const phone = String(body.phone || "").trim();
    const company = String(body.company || "").trim();
    const subject = String(body.subject || "Sales & Wholesale Inquiry").trim();
    const message = String(body.message || "").trim();
    const productId = body.productId ? Number(body.productId) : null;
    const productName = String(body.productName || "").trim();

    if (!name || !email || !email.includes("@") || !message) {
      return NextResponse.json(
        {
          error:
            "Please fill in your name, a valid email address, and your message.",
        },
        { status: 400 }
      );
    }

    const inserted = await db
      .insert(inquiries)
      .values({
        name,
        email,
        phone,
        company,
        subject,
        message,
        productId,
        productName,
        status: "new",
        emailSent: false,
        createdAt: new Date().toISOString(),
      })
      .returning()
      .get();

    const emailSent = await sendInquiryNotificationEmails({
      id: inserted.id,
      name,
      email,
      phone,
      company,
      subject,
      message,
      productName: productName || undefined,
    });

    if (emailSent) {
      await db
        .update(inquiries)
        .set({ emailSent: true })
        .where(eq(inquiries.id, inserted.id))
        .run();
    }

    return NextResponse.json({
      ok: true,
      id: inserted.id,
      emailSent,
    });
  } catch (err) {
    console.error("[Contact API]", err);
    return NextResponse.json(
      {
        error:
          "Unable to submit your inquiry right now. Please call us directly.",
      },
      { status: 500 }
    );
  }
}
