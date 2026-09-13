import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getCurrentSiteConfig } from "@/lib/cms";
import { buildLocalBusinessJsonLd, SITE_URL } from "@/lib/structuredData";
import OpenWidget from "@/components/sections/OpenWidget";
import { inter, hankenGrotesk } from "@/lib/fonts";
import { getHeadScripts } from "@/lib/db/headScripts";
import { getSeoTemplates } from "@/lib/db/seoSettings";
import { getImageDelivery } from "@/lib/db/imageDelivery";
import {
  imageDeliveryBootstrapScript,
  setImageDeliveryConfig,
} from "@/lib/imageDelivery";
import HeadScripts from "@/components/site/HeadScripts";
import { GlobalCustomJsonLd } from "@/components/site/PageSchema";

export async function generateMetadata(): Promise<Metadata> {
  const [siteConfig, templates] = await Promise.all([
    getCurrentSiteConfig(),
    getSeoTemplates(),
  ]);

  const { google, bing, yandex, pinterest, baidu } = templates.verification;

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
      ...(templates.defaultOgImage ? { images: [{ url: templates.defaultOgImage }] } : {}),
    },
    // Search Console and friends verify ownership by reading a meta tag, so
    // these are emitted site-wide from the admin's saved codes.
    verification: {
      ...(google ? { google } : {}),
      ...(yandex ? { yandex } : {}),
      ...(bing || pinterest || baidu
        ? {
            other: {
              ...(bing ? { "msvalidate.01": bing } : {}),
              ...(pinterest ? { "p:domain_verify": pinterest } : {}),
              ...(baidu ? { "baidu-site-verification": baidu } : {}),
            },
          }
        : {}),
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
  const [siteConfig, headScripts, imageDelivery] = await Promise.all([
    getCurrentSiteConfig(),
    getHeadScripts(),
    getImageDelivery(),
  ]);

  // The image loader runs synchronously on both sides of the render, so the
  // server gets the config through a module singleton and the browser gets the
  // identical values from the inline bootstrap script below.
  setImageDeliveryConfig(imageDelivery);

  const jsonLd = buildLocalBusinessJsonLd(siteConfig, SITE_URL);

  return (
    <html lang="en" className={`${inter.variable} ${hankenGrotesk.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: imageDeliveryBootstrapScript(imageDelivery),
          }}
        />
        <HeadScripts entries={headScripts.entries} placement="head" />
      </head>
      <body className="font-sans antialiased selection:bg-[#101314] selection:text-[#c5eb02]">
        <HeadScripts entries={headScripts.entries} placement="body-start" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <GlobalCustomJsonLd />
        <div className="relative flex min-h-screen flex-col overflow-x-hidden">
          {children}
          <OpenWidget />
        </div>
        <HeadScripts entries={headScripts.entries} placement="body-end" />
      </body>
    </html>
  );
}
