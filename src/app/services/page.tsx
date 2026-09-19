import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getCurrentSiteConfig, getPageContent } from "@/lib/cms";
import Process from "@/components/sections/Process";
import Projects from "@/components/sections/Projects";
import { withSeoOverride } from "@/lib/seo";
import PageSchema from "@/components/site/PageSchema";
import { ServiceGroup } from "@/components/site/ServiceCards";
import { buildServiceGroups } from "@/lib/serviceGroups";

export async function generateMetadata(): Promise<Metadata> {
  return withSeoOverride("/services", {
    title: "Our Services",
    description:
      "Solar PV, air source heat pumps, insulation, and property renovation services from Greentek across the West Midlands and Wales.",
  });
}

export default async function ServicesPage() {
  const [{ services }, header, verticals] = await Promise.all([
    getCurrentSiteConfig(),
    getPageContent("services-page-header"),
    getPageContent("verticals"),
  ]);
  const groups = buildServiceGroups(services, verticals.groups);

  return (
    <div className="flex flex-col min-h-screen">
      <PageSchema path="/services" />
      <Header />
      <main className="flex-1">
        <section className="relative  bg-[url('/images/footer/footer-bg.webp')] bg-cover overflow-hidden">
          <div className="bg-black/70 pt-30 py-20">
            <h1 className="text-[2rem] md:text-[3.5rem] font-bold leading-[1.15] text-white  mx-auto text-center">
              {header.headingPrefix} <span className="text-[#c5eb02]">{header.headingHighlight}</span>
            </h1>
            <p className="mt-6 text-md md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed font-medium text-center w-[85%]">
              {header.subheading}
            </p>
            <div className="mt-8 flex justify-center"></div>
          </div>
        </section>

        <section className="py-12 lg:py-24">
          <div className="site-container flex flex-col gap-12 md:gap-14">
            {/* Both groups, laid out like the homepage's Verticals section. */}
            {groups.map((group, i) => (
              <ServiceGroup
                key={group.href}
                name={group.name}
                intro={group.intro}
                href={group.href}
                services={group.services}
                offset={i * 100}
              />
            ))}
          </div>
        </section>

        <Process />
        <Projects />
      </main>

      <Footer />
    </div>
  );
}
