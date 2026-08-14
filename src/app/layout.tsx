import type { Metadata, Viewport } from "next";
import { Inter, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/data/site";
import FloatingActions from "@/components/ui/FloatingActions";
import OpenWidget from "@/components/sections/OpenWidget";
const inter = Inter({ subsets: ["latin"] });
const hanken_Grotesk = Hanken_Grotesk({ subsets: ["latin"] });

export const metadata: Metadata = {
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#c5eb02", 
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased selection:bg-green-100 selection:text-green-900`}
      >
        <div className="relative flex min-h-screen flex-col overflow-x-hidden">
          {children}
          <OpenWidget />
        </div>
      </body>
    </html>
  );
}
