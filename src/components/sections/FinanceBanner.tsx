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
    <section className="px-5 sm:px-15 py-12 md:py-16">
      <div className="mx-auto flex max-w-3xl flex items-center gap-4 text-center">
        {content.logo ? (
          <Image
            src={content.logo}
            alt={content.logoAlt || content.providerName}
            width={320}
            height={90}
            sizes="200px"
            className="h-12 w-auto object-contain md:h-14"
          />
        ) : (
          content.providerName && (
            <p className="text-lg font-bold text-white md:text-xl">
              {content.providerName}
            </p>
          )
        )}

        {content.heading && (
          <p className="text-xl font-semibold text-white md:text-2xl text-balance">
            {content.heading}
          </p>
        )}

        {content.linkLabel && (
          <Link
            href={content.linkHref || "/finance"}
            className="group mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[#c5eb02] transition-colors hover:text-[#c5eb02]/80 md:text-base"
          >
            {content.linkLabel}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>
    </section>
  );
}
