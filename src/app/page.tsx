import type { Metadata } from "next";
import { withSeoOverride } from "@/lib/seo";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import FAQSection from "@/components/sections/FAQSection";
import Testimonials from "@/components/sections/Testimonials";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import Verticals from "@/components/sections/Verticals";
import Stats from "@/components/sections/Stats";
import CtaSection from "@/components/sections/CtaSection";
import Areas from "@/components/sections/Areas";
import Process from "@/components/sections/Process";
import Projects from "@/components/sections/Projects";
import AboutUs from "@/components/sections/AboutUs";
export async function generateMetadata(): Promise<Metadata> {
  return withSeoOverride("/", {
    title: "Solar, Heating & Renovation Experts",
    description:
      "Greentek delivers solar PV, air source heat pumps, insulation, and construction projects across the West Midlands and Wales. Free quotes, in-house team.",
  });
}

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="flex-1">
        <HeroSection />
        <AboutUs />
        <Stats />
        <Verticals />
        <WhyChooseUs />
        <Process />
        <Projects />
        <CtaSection />
        <Testimonials />
        <Areas />
        <FAQSection />
      </div>

      <Footer />
    </div>
  );
}
