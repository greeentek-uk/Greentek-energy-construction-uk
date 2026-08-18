import type { Metadata } from "next";
import { withSeoOverride } from "@/lib/seo";
import { getCurrentSiteConfig, getPageContent } from "@/lib/cms";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AboutUs from "@/components/sections/AboutUs";
import WhyUs from "@/components/sections/WhyUs";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import BrandsSection from "@/components/sections/BrandsSection";
import Process from "@/components/sections/Process";
import AboutPageClient from "./AboutPageClient";

export async function generateMetadata(): Promise<Metadata> {
  return withSeoOverride("/about", {
    title: "About Us",
    description:
      "Greentek is an agile, multi-disciplinary construction and energy firm delivering solar, heat pump, insulation, and renovation projects across the West Midlands and Wales.",
  });
}

export default async function AboutPage() {
  const [siteConfig, content] = await Promise.all([
    getCurrentSiteConfig(),
    getPageContent("about-page"),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <AboutPageClient
        siteConfig={siteConfig}
        content={content}
        whyUsSlot={<WhyUs />}
        aboutUsSlot={<AboutUs />}
        whyChooseUsSlot={<WhyChooseUs />}
        brandsSlot={<BrandsSection />}
        processSlot={<Process />}
      />
      <Footer />
    </div>
  );
}
