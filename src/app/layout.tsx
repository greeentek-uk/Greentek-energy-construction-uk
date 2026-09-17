import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getCurrentSiteConfig } from "@/lib/cms";
import { buildLocalBusinessJsonLd, SITE_URL } from "@/lib/structuredData";
import OpenWidget from "@/components/sections/OpenWidget";
import { inter, hankenGrotesk } from "@/lib/fonts";
import { getHeadScripts } from "@/lib/db/headScripts";
import { getSeoTemplates } from "@/lib/db/seoSettings";
import { getImageDelivery } from "@/lib/db/imageDelivery";
import { getMetaPixelSettings } from "@/lib/db/metaPixel";
import { getClaritySettings } from "@/lib/db/clarity";
import { getGoogleAnalyticsSettings } from "@/lib/db/googleAnalytics";
import { CONSENT_MODE_DEFAULTS_SCRIPT } from "@/lib/consent";
import { scriptConsentOf } from "@/lib/headScripts";
import ConsentProvider from "@/components/site/ConsentProvider";
import TrackingScripts from "@/components/site/TrackingScripts";
import AnalyticsProvider from "@/components/site/AnalyticsProvider";
import ImageDeliveryProvider from "@/components/site/ImageDeliveryProvider";
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
  const [siteConfig, headScripts, imageDelivery, metaPixel, clarity, googleAnalytics] =
    await Promise.all([
      getCurrentSiteConfig(),
      getHeadScripts(),
      getImageDelivery(),
      getMetaPixelSettings(),
      getClaritySettings(),
      getGoogleAnalyticsSettings(),
    ]);

  const metaNecessary = Boolean(metaPixel.pixelId) && metaPixel.consent === "necessary";
  // The banner only offers a Marketing choice when something actually waits for it.
  const showMarketing =
    (Boolean(metaPixel.pixelId) && metaPixel.consent === "marketing") ||
    headScripts.entries.some((e) => e.enabled && scriptConsentOf(e) === "marketing");

  const jsonLd = buildLocalBusinessJsonLd(siteConfig, SITE_URL);

  return (
    <html lang="en" className={`${inter.variable} ${hankenGrotesk.variable}`}>
      <head>
        {/* Must come before any Google tag, so each starts with the visitor's choice. */}
        <script dangerouslySetInnerHTML={{ __html: CONSENT_MODE_DEFAULTS_SCRIPT }} />
        <HeadScripts entries={headScripts.entries} placement="head" />
      </head>
      <body className="font-sans antialiased selection:bg-[#101314] selection:text-[#c5eb02]">
        <HeadScripts entries={headScripts.entries} placement="body-start" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <GlobalCustomJsonLd />
        <ImageDeliveryProvider config={imageDelivery}>
          <ConsentProvider showMarketing={showMarketing} metaNecessary={metaNecessary}>
            <TrackingScripts
              gaMeasurementId={googleAnalytics.measurementId}
              clarityProjectId={clarity.projectId}
            />
            <AnalyticsProvider
              pixelId={metaPixel.pixelId}
              pixelNeedsConsent={metaPixel.consent === "marketing"}
            >
              <div className="relative flex min-h-screen flex-col overflow-x-hidden">
                {children}
                <OpenWidget />
              </div>
            </AnalyticsProvider>
          </ConsentProvider>
        </ImageDeliveryProvider>
        <HeadScripts entries={headScripts.entries} placement="body-end" />
      </body>
    </html>
  );
}
