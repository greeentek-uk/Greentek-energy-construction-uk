import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { siteConfig } from "@/data/site";
import Process from "@/components/sections/Process";
import Image from "next/image";
import Link from "next/link";
import { withSeoOverride } from "@/lib/seo";

const HOME_FORM_CATEGORIES = ["refurb_extension"];

export function generateMetadata(): Metadata {
  return withSeoOverride("/home-solutions", {
    title: "Home Solutions",
    description:
      "Greentek is the primary contractor for renovations, extensions, and planned maintenance across residential and commercial properties in the West Midlands and Wales.",
  });
}

export default function HomeSolutionsPage() {
  const services = siteConfig.services.filter((service) =>
    HOME_FORM_CATEGORIES.includes(service.formCategory),
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="relative bg-[url('/images/verticals/home.jpeg')] bg-cover bg-center overflow-hidden">
          <div className="bg-black/70 pt-30 py-20">
            <p className="text-[10px] md:text-[16px] font-semibold uppercase mb-6 bg-[#28282C] text-[#c5eb02] rounded-xl px-3 py-1 w-fit mx-auto">
              Home Solutions
            </p>
            <h1 className="text-[2rem] md:text-[3.5rem] font-bold leading-[1.15] text-white mx-auto text-center">
              A Home That Works <span className="text-[#c5eb02]">Harder</span>
            </h1>
            <p className="mt-6 text-xl text-white/80 max-w-2xl mx-auto leading-relaxed font-medium text-center">
              Primary contractor for renovations, extensions, and planned
              maintenance across residential and commercial properties.
            </p>
          </div>
        </section>

        <section className="py-12 lg:py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {services.map((service) => (
                <Link
                  href={`/services/${service.slug}`}
                  key={service.slug}
                  className="group relative rounded-xl bg-[#101314] hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-500 overflow-hidden flex flex-col sm:flex-row gap-0 sm:gap-6"
                >
                  <div className="w-full h-48 sm:h-auto sm:w-[40%]">
                    <Image
                      src={service.image}
                      alt={service.title}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="w-full sm:w-[60%] py-4 px-6 flex flex-col justify-center">
                    <h3 className="text-[1.25rem] md:text-[1.5rem] font-bold leading-[1.3] text-white mb-4 group-hover:text-[#c5eb02] transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-white/80 leading-relaxed font-medium">
                      {service.description}
                    </p>
                    <span className="mt-4 text-[#c5eb02] font-bold text-sm">
                      Learn More →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <Process />
      </main>

      <Footer />
    </div>
  );
}
