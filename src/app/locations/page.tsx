import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getCurrentSiteConfig } from "@/lib/cms";
import { withSeoOverride } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return withSeoOverride("/locations", {
    title: "Areas We Cover",
    description:
      "Greentek delivers solar PV, heat pump, insulation and renovation projects across the West Midlands and Wales, including Solihull, Birmingham, Wolverhampton, Coventry, Dudley, Cardiff and Swansea.",
  });
}

export default async function LocationsPage() {
  const { locations } = await getCurrentSiteConfig();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="relative bg-[url('/images/footer/footer-bg.webp')] bg-cover overflow-hidden">
          <div className="bg-black/70 pt-30 py-20">
            <h1 className="text-[2rem] md:text-[3.5rem] font-bold leading-[1.15] text-white mx-auto text-center">
              Areas We <span className="text-[#c5eb02]">Cover</span>
            </h1>
            <p className="mt-6 text-md md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed font-medium text-center w-[85%]">
              Greentek is in-house, not a subcontracted franchise. Our teams
              live and work across the West Midlands and Wales, delivering
              solar, heating, insulation and renovation projects locally.
            </p>
          </div>
        </section>

        <section className="py-12 lg:py-24">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {locations.map((location) => (
                <Link
                  key={location.slug}
                  href={`/locations/${location.slug}`}
                  className="group relative rounded-xl overflow-hidden min-h-[260px] flex flex-col justify-end p-6"
                >
                  <Image
                    src={location.image}
                    alt={location.name}
                    fill
                    className="object-cover -z-10 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent -z-10" />
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-[#c5eb02] transition-colors">
                    {location.name}
                  </h3>
                  <span className="text-[#c5eb02] font-bold text-sm">
                    View Services in {location.name} →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
