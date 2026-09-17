import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getCurrentSiteConfig } from "@/lib/cms";
import LeadConversion from "./LeadConversion";

// Confirmation pages have nothing to rank for, and listing them lets anyone
// reach the URL that marks a conversion.
export const metadata: Metadata = {
  title: "Thank you",
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: Promise<{ eid?: string }>;
}

export default async function ThankYouPage({ searchParams }: Props) {
  const [{ eid }, siteConfig] = await Promise.all([searchParams, getCurrentSiteConfig()]);

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <LeadConversion eventId={eid ?? null} />
      <Header />
      <main className="flex flex-1 items-center px-6 py-20 md:py-28">
        <div className="mx-auto flex max-w-xl flex-col items-center text-center">
          <span className="mb-6 grid h-14 w-14 place-items-center rounded-full bg-[#c5eb02]">
            <Check className="h-7 w-7 text-black" />
          </span>
          <h1 className="text-[2rem] font-bold leading-[1.15] text-white md:text-[2.75rem] text-balance">
            Thanks, your enquiry is with us
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-white/75">
            A member of the team will contact you within one business day to discuss your
            property and arrange the next step.
          </p>
          <p className="mt-3 text-lg leading-relaxed text-white/75">
            Need to speak sooner? Call{" "}
            <a
              href={`tel:${siteConfig.phone.replace(/[^\d+]/g, "")}`}
              className="font-semibold text-[#c5eb02] underline-offset-4 hover:underline whitespace-nowrap"
            >
              {siteConfig.phone}
            </a>
            .
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="rounded bg-[#c5eb02] px-5 py-3 text-sm font-semibold text-black transition active:scale-95 md:text-base"
            >
              Back to home
            </Link>
            <Link
              href="/projects"
              className="group inline-flex items-center gap-2 rounded border border-white/25 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-[#c5eb02] hover:text-[#c5eb02] md:text-base"
            >
              See our recent projects
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
