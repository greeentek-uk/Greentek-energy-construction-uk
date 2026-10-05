import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, Phone } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageSchema from "@/components/site/PageSchema";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import Link from "@/components/ui/Link";
import { getPageContent } from "@/lib/cms";
import { withSeoOverride } from "@/lib/seo";
import { FINANCE_PROVIDERS, financeProvider, paragraphs } from "@/lib/financeProviders";
import IdealRates from "../IdealRates";
import {
  ActionLink,
  Disclosure,
  ProviderLogo,
  RiskWarning,
  primaryButton,
  secondaryButton,
} from "../FinanceParts";

interface Props {
  params: Promise<{ provider: string }>;
}

export function generateStaticParams() {
  return FINANCE_PROVIDERS.map((p) => ({ provider: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const meta = financeProvider((await params).provider);
  if (!meta) return { title: "Finance" };
  const provider = await getPageContent(meta.block);
  return withSeoOverride(`/finance/${meta.slug}`, {
    title: `${provider.heading || `Finance with ${provider.name}`}`,
    description: provider.intro.slice(0, 155),
  });
}

/**
 * One finance provider's page. Both providers render through this one route
 * and layout, so neither is presented more favourably; only Ideal4Finance adds
 * its published rates, because only it publishes any.
 */
export default async function FinanceProviderPage({ params }: Props) {
  const meta = financeProvider((await params).provider);
  if (!meta) notFound();
  const provider = await getPageContent(meta.block);
  const others = FINANCE_PROVIDERS.filter((p) => p.slug !== meta.slug);

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <PageSchema path={`/finance/${meta.slug}`} />
      <Breadcrumbs crumbs={[{ label: "Finance", href: "/finance" }, { label: provider.name }]} />
      <Header />

      <main className="flex-1">
        <section className="relative bg-[url('/images/footer/footer-bg.webp')] bg-cover overflow-hidden">
          <div className="bg-black/75 pt-20 py-14">
            <div className="mx-auto max-w-4xl px-6 text-center">
              <div className="mx-auto mb-6 flex h-16 w-fit items-center rounded-2xl bg-black/40 px-5">
                <ProviderLogo provider={provider} className="h-10 md:h-12" priority />
              </div>
              <h1 className="text-[2rem] md:text-[3.5rem] font-bold leading-[1.15] text-white mb-6 text-balance">
                {provider.heading}
              </h1>
              <p className="text-lg md:text-xl text-white/80 leading-relaxed font-medium max-w-2xl mx-auto mb-10">
                {provider.intro}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {provider.applyLabel && provider.applyUrl && (
                  <ActionLink href={provider.applyUrl} className={primaryButton}>
                    {provider.applyLabel}
                    <ArrowRight className="h-4 w-4" />
                  </ActionLink>
                )}
                {provider.secondaryLabel && provider.secondaryUrl && (
                  <ActionLink href={provider.secondaryUrl} className={secondaryButton}>
                    {provider.secondaryLabel}
                  </ActionLink>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* One centred column for the whole page (the same 56rem as the closing
            disclosure), so every section shares the calculator's centre line
            instead of some sitting left-aligned across the full width. */}
        <section className="py-10 lg:py-16">
          <div className="site-container">
            <div className="site-prose mx-auto space-y-14">
              {provider.features.length > 0 && (
                <div>
                  <h2 className="text-[1.625rem] md:text-[2.25rem] font-bold leading-[1.2] text-white mb-6 text-center">
                    Key points
                  </h2>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {provider.features.map((f) => (
                      <li key={f} className="flex gap-3 rounded-xl bg-white/5 border border-white/10 px-5 py-4 text-white/80">
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#c5eb02]" aria-hidden />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {provider.howItWorks && (
                <div className="text-center">
                  <h2 className="text-[1.625rem] md:text-[2.25rem] font-bold leading-[1.2] text-white mb-6">
                    How it works
                  </h2>
                  {paragraphs(provider.howItWorks).map((p) => (
                    <p key={p} className="text-lg text-white/75 leading-relaxed mb-4">
                      {p}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {meta.slug === "ideal4finance" && <IdealRates />}

        {/* Risk, support and the mandatory statement — the same treatment for every provider. */}
        <section className="py-10 lg:py-16">
          <div className="site-container">
            <div className="site-prose mx-auto space-y-6">
              <RiskWarning text={provider.riskWarning} />
              {(provider.supportText || provider.phone) && (
                <p className="text-lg text-white/70 leading-relaxed text-center">
                  {provider.supportText}{" "}
                  {provider.phone && (
                    <a
                      href={`tel:${provider.phone.replace(/[^\d+]/g, "")}`}
                      className="inline-flex items-center gap-1.5 text-[#c5eb02] font-bold hover:text-[#c5eb02]/80"
                    >
                      <Phone className="h-4 w-4" aria-hidden />
                      {provider.phone}
                    </a>
                  )}
                </p>
              )}
              <div className="border-t border-white/10 pt-6">
                <Disclosure text={provider.disclosure} />
              </div>
              {others.length > 0 && (
                <p className="text-sm text-white/60 text-center">
                  Also available:{" "}
                  {others.map((o, i) => (
                    <span key={o.slug}>
                      {i > 0 && ", "}
                      <Link href={`/finance/${o.slug}`} className="text-[#c5eb02] font-semibold hover:underline">
                        finance with {o.name}
                      </Link>
                    </span>
                  ))}{" "}
                  · <Link href="/finance" className="text-[#c5eb02] font-semibold hover:underline">compare both</Link>
                </p>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
