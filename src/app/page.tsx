import type { Metadata } from "next";
import { withSeoOverride } from "@/lib/seo";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import FAQSection from "@/components/sections/FAQSection";
import Testimonials from "@/components/sections/Testimonials";
import Stats from "@/components/sections/Stats";
import Areas from "@/components/sections/Areas";
import Process from "@/components/sections/Process";
import Projects from "@/components/sections/Projects";
import AboutUs from "@/components/sections/AboutUs";
import PageSchema from "@/components/site/PageSchema";
import FinanceBanner from "@/components/sections/FinanceBanner";
import FeaturedServices from "@/components/sections/FeaturedServices";
export async function generateMetadata(): Promise<Metadata> {
  return withSeoOverride("/", {
    kind: "home",
    title: "Solar, Heating & Renovation Experts",
    description:
      "Greentek delivers solar PV, air source heat pumps, insulation, and construction projects across the West Midlands and Wales. Free quotes, in-house team.",
  });
}

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageSchema path="/" />
      <Header />

      <div className="flex-1">
        <HeroSection />
        <FinanceBanner />
        <Projects />
        <Testimonials />
        <AboutUs />
        <FeaturedServices />
        <Stats />
        <Process />
        <Areas />
        <FAQSection />
      </div>

      <Footer />
    </div>
  );
}
