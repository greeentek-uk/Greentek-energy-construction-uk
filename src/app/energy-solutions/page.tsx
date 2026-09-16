import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getCurrentSiteConfig, getPageContent } from "@/lib/cms";
import Process from "@/components/sections/Process";
import { withSeoOverride } from "@/lib/seo";
import PageSchema from "@/components/site/PageSchema";
import { ServiceCardGrid } from "@/components/site/ServiceCards";
import { buildServiceGroups } from "@/lib/serviceGroups";


export async function generateMetadata(): Promise<Metadata> {
  return withSeoOverride("/energy-solutions", {
    title: "Energy Solutions",
    description:
      "Turnkey multi-measure energy upgrades from Greentek, from Solar PV to high-efficiency thermal systems and insulation, across the West Midlands and Wales.",
  });
}

export default async function EnergySolutionsPage() {
  const [siteConfig, verticals] = await Promise.all([
    getCurrentSiteConfig(),
    getPageContent("verticals"),
  ]);
  const group = buildServiceGroups(siteConfig.services, verticals.groups)[0];

  return (
    <div className="flex flex-col min-h-screen">
      <PageSchema path="/energy-solutions" />
      <Header />
      <main className="flex-1">
        <section className="relative bg-[url('/images/verticals/energy.avif')] bg-cover bg-center overflow-hidden">
          <div className="bg-black/70 pt-30 py-20">
            <p className="text-[10px] md:text-[16px] font-semibold uppercase mb-6 bg-[#28282C] text-[#c5eb02] rounded-xl px-3 py-1 w-fit mx-auto">
              Energy Solutions
            </p>
            <h1 className="text-[2rem] md:text-[3.5rem] font-bold leading-[1.15] text-white mx-auto text-center">
              Power Your Property For{" "}
              <span className="text-[#c5eb02]">Less</span>
            </h1>
            <p className="mt-6 text-xl text-white/80 max-w-2xl mx-auto leading-relaxed font-medium text-center">
              Turnkey multi-measure energy upgrades, from Solar PV to
              high-efficiency thermal systems, delivered by one accredited team
              from day one.
            </p>
          </div>
        </section>

        <section className="py-12 lg:py-24">
          <div className="mx-auto max-w-7xl px-6">
            {/* Same card as the homepage's Verticals section. */}
            <ServiceCardGrid services={group.services} />
          </div>
        </section>

        <Process />
      </main>

      <Footer />
    </div>
  );
}
