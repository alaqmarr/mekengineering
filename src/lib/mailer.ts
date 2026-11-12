import nodemailer from "nodemailer";
import { getIntegrationCredentials, getSiteContentMap } from "@/db/queries";

async function buildTransporter() {
  const creds = await getIntegrationCredentials();
  const isConfigured = Boolean(creds.smtpHost && creds.smtpUser && creds.smtpPass);

  if (!isConfigured) {
    return { transporter: null, creds, isConfigured: false };
  }

  const transporter = nodemailer.createTransport({
    host: creds.smtpHost,
    port: creds.smtpPort,
    secure: creds.smtpSecure,
    auth: {
      user: creds.smtpUser,
      pass: creds.smtpPass,
    },
  });

  return { transporter, creds, isConfigured: true };
}

export async function sendTestSmtpEmail(recipientEmail?: string): Promise<{
  ok: boolean;
  message: string;
}> {
  const { transporter, creds, isConfigured } = await buildTransporter();
  if (!isConfigured || !transporter) {
    return {
      ok: false,
      message:
        "Gmail SMTP credentials are incomplete. Please provide SMTP Host, Gmail Address, and 16-digit Google App Password.",
    };
  }

  const target = (recipientEmail || creds.adminNotificationEmail || creds.smtpUser).trim();

  try {
    await transporter.verify();
    await transporter.sendMail({
      from: `"${creds.smtpFromName}" <${creds.smtpFromEmail || creds.smtpUser}>`,
      to: target,
      subject: `✅ SMTP Test Successful - Mek Engineering Corporation (mekengg.com)`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f1115; color: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #27272a;">
          <div style="background: #eb2d4a; padding: 20px 28px;">
            <h1 style="margin: 0; font-size: 20px; letter-spacing: 1px; text-transform: uppercase; color: #ffffff;">MEK ENGINEERING CORPORATION</h1>
            <p style="margin: 4px 0 0; font-size: 12px; color: rgba(255,255,255,0.9); text-transform: uppercase; letter-spacing: 2px;">Nodemailer + Gmail SMTP Verification</p>
          </div>
          <div style="padding: 28px;">
            <p style="margin-top: 0; font-size: 15px; line-height: 1.6; color: #e2e8f0;">
              Your <strong>Nodemailer + Gmail SMTP</strong> configuration stored in the database is working smoothly!
            </p>
            <div style="background: #181b20; border-left: 4px solid #eb2d4a; padding: 14px 18px; border-radius: 6px; margin: 20px 0; font-size: 13px; color: #cbd5e1;">
              <div><strong>SMTP Host:</strong> ${creds.smtpHost}:${creds.smtpPort} (${creds.smtpSecure ? "SSL/TLS" : "STARTTLS"})</div>
              <div style="margin-top: 4px;"><strong>Authenticated Account:</strong> ${creds.smtpUser}</div>
              <div style="margin-top: 4px;"><strong>Lead Notification Recipient:</strong> ${target}</div>
            </div>
            <p style="font-size: 12px; color: #94a3b8; margin-bottom: 0;">
              Domain: <a href="https://mekengg.com" style="color: #eb2d4a; text-decoration: none;">https://mekengg.com</a>
            </p>
          </div>
        </div>
      `,
    });

    return {
      ok: true,
      message: `Test email sent successfully to ${target}!`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "SMTP connection failed";
    return {
      ok: false,
      message: `SMTP Error: ${message}`,
    };
  }
}

export async function sendInquiryNotificationEmails(inquiry: {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  message: string;
  productName?: string;
}): Promise<boolean> {
  const { transporter, creds, isConfigured } = await buildTransporter();
  if (!isConfigured || !transporter) {
    return false;
  }

  const content = await getSiteContentMap();
  const primaryColor = content["theme.primaryColor"] || "#eb2d4a";
  const companyPhone = content["contact.phone"] || "+91 93910 79492";
  const fromHeader = `"${creds.smtpFromName}" <${creds.smtpFromEmail || creds.smtpUser}>`;

  try {
    // 1. Admin Lead Notification Email
    await transporter.sendMail({
      from: fromHeader,
      to: creds.adminNotificationEmail || creds.smtpUser,
      replyTo: inquiry.email,
      subject: `[Inquiry #${inquiry.id}] ${inquiry.productName ? `Quote: ${inquiry.productName}` : inquiry.subject} - ${inquiry.name}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: #111318; border-bottom: 4px solid ${primaryColor}; padding: 24px 30px;">
            <div style="color: ${primaryColor}; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px;">New Website Inquiry • mekengg.com</div>
            <h2 style="margin: 6px 0 0; color: #ffffff; font-size: 22px; text-transform: uppercase;">${inquiry.productName ? `Quote Request: ${inquiry.productName}` : inquiry.subject}</h2>
          </div>
          <div style="padding: 28px 30px; color: #22262a;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
              <tr><td style="padding: 8px 0; color: #64748b; width: 140px;"><strong>Customer Name:</strong></td><td style="padding: 8px 0; font-weight: 600;">${escapeHtml(inquiry.name)}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;"><strong>Email Address:</strong></td><td style="padding: 8px 0;"><a href="mailto:${escapeHtml(inquiry.email)}" style="color: ${primaryColor};">${escapeHtml(inquiry.email)}</a></td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;"><strong>Phone / WhatsApp:</strong></td><td style="padding: 8px 0;">${escapeHtml(inquiry.phone || "Not provided")}</td></tr>
              ${inquiry.company ? `<tr><td style="padding: 8px 0; color: #64748b;"><strong>Company / Firm:</strong></td><td style="padding: 8px 0;">${escapeHtml(inquiry.company)}</td></tr>` : ""}
              ${inquiry.productName ? `<tr><td style="padding: 8px 0; color: #64748b;"><strong>Equipment:</strong></td><td style="padding: 8px 0; font-weight: 700; color: ${primaryColor};">${escapeHtml(inquiry.productName)}</td></tr>` : ""}
            </table>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid ${primaryColor}; border-radius: 8px; padding: 16px 20px;">
              <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 6px;">Customer Message</div>
              <div style="font-size: 14px; line-height: 1.65; white-space: pre-wrap;">${escapeHtml(inquiry.message)}</div>
            </div>
          </div>
          <div style="background: #f3f5f7; padding: 14px 30px; font-size: 12px; color: #64748b;">
            Saved automatically to SQLite Inquiries (#${inquiry.id}) on <strong>mekengg.com</strong>. Reply directly to this email to respond to ${escapeHtml(inquiry.name)}.
          </div>
        </div>
      `,
    });

    // 2. Customer Auto-Acknowledgement Email
    await transporter.sendMail({
      from: fromHeader,
      to: inquiry.email,
      subject: `We received your inquiry - Mek Engineering Corporation`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: #111318; border-bottom: 4px solid ${primaryColor}; padding: 24px 30px;">
            <h2 style="margin: 0; color: #ffffff; font-size: 20px; letter-spacing: 1px; text-transform: uppercase;">MEK ENGINEERING CORPORATION</h2>
            <p style="margin: 4px 0 0; color: rgba(255,255,255,0.75); font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Since 1968 • Secunderabad</p>
          </div>
          <div style="padding: 28px 30px; color: #22262a; font-size: 14px; line-height: 1.65;">
            <p>Dear <strong>${escapeHtml(inquiry.name)}</strong>,</p>
            <p>Thank you for contacting <strong>Mek Engineering Corporation</strong>${inquiry.productName ? ` regarding <strong>${escapeHtml(inquiry.productName)}</strong>` : ""}. Our technical sales desk has received your request (Reference <strong>#${inquiry.id}</strong>) and will get back to you promptly.</p>
            <p>For urgent wholesale pricing or immediate stock verification, feel free to call us directly at <strong>${escapeHtml(companyPhone)}</strong>.</p>
            <p style="margin-top: 24px; margin-bottom: 0;">Warm regards,<br/><strong>Sales & Technical Desk</strong><br/>Mek Engineering Corporation<br/><a href="https://mekengg.com" style="color: ${primaryColor}; text-decoration: none;">https://mekengg.com</a></p>
          </div>
        </div>
      `,
    });

    return true;
  } catch (err) {
    console.error("[Mailer] Error sending inquiry emails:", err);
    return false;
  }
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
