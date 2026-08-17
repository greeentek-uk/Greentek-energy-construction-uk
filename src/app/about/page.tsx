import type { Metadata } from "next";
import { withSeoOverride } from "@/lib/seo";
import { getCurrentSiteConfig } from "@/lib/cms";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AboutUs from "@/components/sections/AboutUs";
import AboutPageClient from "./AboutPageClient";

export async function generateMetadata(): Promise<Metadata> {
  return withSeoOverride("/about", {
    title: "About Us",
    description:
      "Greentek is an agile, multi-disciplinary construction and energy firm delivering solar, heat pump, insulation, and renovation projects across the West Midlands and Wales.",
  });
}

export default async function AboutPage() {
  const siteConfig = await getCurrentSiteConfig();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <AboutPageClient siteConfig={siteConfig} aboutUsSlot={<AboutUs />} />
      <Footer />
    </div>
  );
}
