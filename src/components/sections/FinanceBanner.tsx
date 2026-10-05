import Image from "next/image";
import Link from "@/components/ui/Link";
import { Fragment } from "react";
import { getPageContent } from "@/lib/cms";
import { FINANCE_PROVIDERS } from "@/lib/financeProviders";

/**
 * Finance availability strip: a short line and the providers' logos (Ideal
 * Finance and Phoenix — up to two), each logo linking to its provider's page.
 *
 * Everything is editable in the panel, including the logo — until one is
 * uploaded the provider's name stands in as text, so the banner never renders
 * a gap where a logo should be.
 */
/**
 * One provider: its logo, or its name as text until a logo is uploaded — so
 * the strip never shows a gap. Shared by both provider slots so they match.
 */
function ProviderMark({ logo, alt, name }: { logo?: string; alt?: string; name?: string }) {
  if (logo) {
    return (
      <Image
        src={logo}
        alt={alt || name || "Finance provider"}
        width={320}
        height={110}
        sizes="200px"
        className="h-6 w-auto shrink-0 object-contain sm:h-10 md:h-14"
      />
    );
  }
  return name ? (
    <p className="whitespace-nowrap text-sm font-bold text-white sm:text-lg md:text-xl">{name}</p>
  ) : null;
}

/** `heading` rewords the strip on one page; blank keeps the shared block's. */
export default async function FinanceBanner({ heading }: { heading?: string } = {}) {
  const shared = await getPageContent("finance-banner");
  const content = { ...shared, heading: heading?.trim() || shared.heading };
  const providers = [
    {
      logo: content.logo,
      alt: content.logoAlt,
      name: content.providerName,
      href: content.logoHref || `/finance/${FINANCE_PROVIDERS[0].slug}`,
    },
    {
      logo: content.logo2,
      alt: content.logo2Alt,
      name: content.provider2Name,
      href: content.logo2Href || `/finance/${FINANCE_PROVIDERS[1].slug}`,
    },
  ].filter((p) => p.logo || p.name);
  if (!content.heading && !providers.length) return null;

  return (
    <section className="py-2 md:py-4 bg-[#101314]">
      {/*
        One horizontal line at every width, phone included — the type and
        logos step down instead of wrapping.

        Each logo links to that provider's own finance page. The strip used to
        be one link to /finance with an "Explore financing options" label; the
        owner asked (2026-10-06) for the label to go and the logos to take the
        reader straight to the provider they picked.
      */}
      <div className="site-container flex items-center justify-center gap-2 sm:gap-4">
        {content.heading && (
          <p className="whitespace-nowrap text-[11px] font-semibold leading-tight text-white sm:text-base md:text-xl">
            {content.heading}
          </p>
        )}
        {providers.map((p, i) => (
          <Fragment key={p.href}>
            {i > 0 && (
              <span aria-hidden className="text-sm font-semibold text-white/60 sm:text-lg">
                &amp;
              </span>
            )}
            <Link
              href={p.href}
              aria-label={`Finance with ${p.name || p.alt || "this provider"}`}
              className="shrink-0 rounded-md transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#c5eb02]"
            >
              <ProviderMark logo={p.logo} alt={p.alt} name={p.name} />
            </Link>
          </Fragment>
        ))}
      </div>
    </section>
  );
}
