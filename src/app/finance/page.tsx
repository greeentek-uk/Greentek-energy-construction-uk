import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageSchema from "@/components/site/PageSchema";
import { withSeoOverride } from "@/lib/seo";
import { getPageContent } from "@/lib/cms";
import { FINANCE_PROVIDERS } from "@/lib/financeProviders";
import { ProviderCard } from "./FinanceParts";

export async function generateMetadata(): Promise<Metadata> {
  return withSeoOverride("/finance", {
    title: "Finance Options | Spread the Cost",
    description:
      "Spread the cost of your solar, heating or renovation project with finance through Ideal4Finance or Phoenix Financial Consultants. Finance subject to status.",
  });
}

/**
 * The finance overview: both providers side by side as equal cards, each
 * carrying its own risk warning and mandatory disclosure, and each linking to
 * its own page. Rates and the calculator moved to the Ideal4Finance page —
 * they're that provider's figures, not a general offer.
 */
export default async function FinancePage() {
  const providers = await Promise.all(
    FINANCE_PROVIDERS.map(async (p) => ({ ...p, content: await getPageContent(p.block) })),
  );

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <PageSchema path="/finance" />
      <Header />

      <main className="flex-1">
        <section className="relative bg-[url('/images/footer/footer-bg.webp')] bg-cover overflow-hidden">
          <div className="bg-black/70 pt-20 py-14">
            <div className="mx-auto max-w-4xl px-6 text-center">
              <p className="text-[10px] md:text-[16px] font-semibold uppercase mb-6 bg-[#28282C] text-[#c5eb02] rounded-2xl px-3 py-1 w-fit mx-auto">
                Finance
              </p>
              <h1 className="text-[2rem] md:text-[3.5rem] font-bold leading-[1.15] text-white mb-6">
                Spread the cost with <span className="text-[#c5eb02]">flexible finance</span>
              </h1>
              <p className="text-lg md:text-xl text-white/80 leading-relaxed font-medium max-w-2xl mx-auto">
                At Greentek Energy Ltd, we understand that customers may prefer to pay with finance, so
                we&apos;ve partnered with two established credit brokers. Choose the one that suits you
                to spread the cost with monthly payments.
              </p>
            </div>
          </div>
        </section>

        <section className="py-10 lg:py-16">
          <div className="site-container grid gap-6 md:grid-cols-2">
            {providers.map((p) => (
              <ProviderCard key={p.slug} provider={p.content} href={`/finance/${p.slug}`} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
