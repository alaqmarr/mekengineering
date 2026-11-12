import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
import { getSafeSession } from "@/auth";
import {
  getAllCategoriesWithCounts,
  getSiteBaseUrl,
  getSiteContentMap,
} from "@/db/queries";
import { CmsProvider } from "@/components/cms/CmsContext";
import { AdminFloatingBar } from "@/components/cms/AdminFloatingBar";
import { SiteToaster } from "@/lib/toast";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContentMap();
  const siteUrl = await getSiteBaseUrl(content);
  const siteName = content["site.name"] || "Mek Engineering Corporation";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${siteName} | Premium Power Tools & Industrial Machinery`,
      template: `%s | ${siteName}`,
    },
    description:
      "Established in 1968, Mek Engineering Corporation is a premier wholesale trader of Power Tools, Hand Tools, and Industrial Machinery in Secunderabad. Authorized dealers for Bosch, DeWalt, Taparia, CZAR Power Pro, and TEZ.",
    applicationName: siteName,
    openGraph: {
      siteName,
      locale: "en_IN",
      type: "website",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [session, content, categories] = await Promise.all([
    getSafeSession(),
    getSiteContentMap(),
    getAllCategoriesWithCounts(),
  ]);
  const isAdmin = Boolean(
    session?.user && (session.user as { role?: string }).role === "admin"
  );
  const primaryColor = content["theme.primaryColor"] || "#eb2d4a";

  return (
    <html
      lang="en"
      className="scroll-smooth"
      style={
        {
          "--primary": primaryColor,
          "--ring": primaryColor,
          "--sileo-state-success": primaryColor,
          "--sileo-state-info": primaryColor,
          "--sileo-state-action": primaryColor,
          "--sileo-state-loading": primaryColor,
        } as React.CSSProperties
      }
    >
      <body
        className={`${inter.variable} ${oswald.variable} font-sans bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground`}
      >
        <SessionProvider session={session}>
          <CmsProvider
            isAdmin={isAdmin}
            adminEmail={session?.user?.email}
            initialContent={content}
          >
            <SiteToaster />
            <div className="flex min-h-screen flex-col">
              <Navbar
                categories={categories.map((c) => ({
                  id: c.id,
                  name: c.name,
                  slug: c.slug,
                  shortDescription: c.shortDescription,
                  productCount: c.productCount,
                  subcategoryCount: c.subcategoryCount,
                }))}
              />
              <main className="flex-1">{children}</main>
              <Footer
                topCategories={categories.map((c) => ({
                  id: c.id,
                  name: c.name,
                  slug: c.slug,
                }))}
              />
            </div>
            <AdminFloatingBar />
          </CmsProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
