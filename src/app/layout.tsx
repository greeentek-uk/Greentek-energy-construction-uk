import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getCurrentSiteConfig } from "@/lib/cms";
import { buildLocalBusinessJsonLd, SITE_URL } from "@/lib/structuredData";
import OpenWidget from "@/components/sections/OpenWidget";
import { inter, hankenGrotesk } from "@/lib/fonts";

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getCurrentSiteConfig();

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: siteConfig.name,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: [
      "construction",
      "renewable energy",
      "solar PV installation",
      "air source heat pump",
      "ASHP",
      "boiler upgrade",
      "central heating",
      "loft insulation",
      "external wall insulation",
      "property refurbishment",
      "house refurbishment",
      "kitchen refurbishment",
      "bathroom refurbishment",
      "building extension",
      "home renovation",
      "West Midlands",
      "Wolverhampton",
      "Wales",
      "construction contractor",
      "energy solutions",
    ],
    icons: {
      icon: "/images/favicon.ico",
      apple: "/images/apple.png",
    },
    openGraph: {
      title: siteConfig.name,
      description: siteConfig.description,
      type: "website",
      locale: "en_GB",
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#c5eb02",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteConfig = await getCurrentSiteConfig();
  const jsonLd = buildLocalBusinessJsonLd(siteConfig, SITE_URL);

  return (
    <html lang="en" className={`${inter.variable} ${hankenGrotesk.variable}`}>
      <body className="font-sans antialiased selection:bg-[#101314] selection:text-[#c5eb02]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="relative flex min-h-screen flex-col overflow-x-hidden">
          {children}
          <OpenWidget />
        </div>
      </body>
    </html>
  );
}
