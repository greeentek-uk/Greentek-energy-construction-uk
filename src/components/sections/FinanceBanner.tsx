import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getPageContent } from "@/lib/cms";

/**
 * Finance availability strip: the provider's logo, a short line, and a link
 * through to the finance page.
 *
 * Everything is editable in the panel, including the logo — until one is
 * uploaded the provider's name stands in as text, so the banner never renders
 * a gap where a logo should be.
 */
export default async function FinanceBanner() {
  const content = await getPageContent("finance-banner");
  if (!content.heading && !content.linkLabel) return null;

  return (
    <section className="py-2 md:py-4 bg-[#101314]">
      {/*
        One horizontal line at every width, phone included.

        Each column used to wrap independently, so on a phone the strip became
        three narrow stacks of three or four words. Nothing wraps now: the type
        and logo step down instead, and below `sm` the link gives way to its
        arrow — the whole strip is the link, so it stays one clear tap target.
      */}
      <Link
        href={content.linkHref || "/finance"}
        className="site-container group flex items-center justify-center gap-2 sm:gap-4"
      >
        {content.heading && (
          <p className="whitespace-nowrap text-[11px] font-semibold leading-tight text-white sm:text-base md:text-xl">
            {content.heading}
          </p>
        )}
        {content.logo ? (
          <Image
            src={content.logo}
            alt={content.logoAlt || content.providerName}
            width={320}
            height={90}
            sizes="200px"
            className="h-6 w-auto shrink-0 object-contain sm:h-10 md:h-14"
          />
        ) : (
          content.providerName && (
            <p className="whitespace-nowrap text-sm font-bold text-white sm:text-lg md:text-xl">
              {content.providerName}
            </p>
          )
        )}
        <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[11px] font-semibold text-[#c5eb02] transition-colors group-hover:text-[#c5eb02]/80 sm:text-sm md:text-base">
          <span className="hidden sm:inline">{content.linkLabel}</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </Link>
    </section>
  );
}
