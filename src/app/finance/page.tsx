import type { Metadata } from "next";
import { ArrowRight, Calculator, ShieldAlert } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { withSeoOverride } from "@/lib/seo";
import FinanceCalculator from "./FinanceCalculator";

const APPLY_URL = "https://ideal4finance.com/loan-apply/grntekener";

const FINANCE_OPTIONS = [
  { rate: "0% APR finance", terms: "3, 6, 12 or 24 months" },
  { rate: "11.9% APR finance", terms: "36, 48 or 60 months" },
  { rate: "10.9% APR finance", terms: "120 months" },
];

const EXAMPLE_ROWS = [
  { label: "Purchase price", value: "£5,000" },
  { label: "Deposit amount (25%)", value: "£1,250" },
  { label: "Total credit", value: "£3,750" },
  { label: "Loan term", value: "60 months" },
  { label: "APR", value: "11.9% (fixed)" },
  { label: "Monthly repayment", value: "£83.23" },
  { label: "Total repayable", value: "£4,993.64" },
  { label: "Total cost", value: "£6,243.64" },
];

export async function generateMetadata(): Promise<Metadata> {
  return withSeoOverride("/finance", {
    title: "Finance Options | Spread the Cost",
    description:
      "Spread the cost of your solar, heating or renovation project with flexible finance from Ideal4Finance, including 0% APR options over 3 to 24 months.",
  });
}

export default function FinancePage() {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="py-12 md:py-20 border-b border-[#c5eb02]">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <p className="text-[10px] md:text-[16px] font-semibold uppercase mb-6 bg-[#28282C] text-[#c5eb02] rounded-2xl px-3 py-1 w-fit mx-auto">
              Finance
            </p>
            <h1 className="text-[2rem] md:text-[3.5rem] font-bold leading-[1.15] text-white mb-6">
              Spread the cost with{" "}
              <span className="text-[#c5eb02]">flexible finance</span>
            </h1>
            <p className="text-lg md:text-xl text-white/70 leading-relaxed font-medium max-w-2xl mx-auto mb-10">
              At Greentek Energy Ltd, we understand that customers may prefer
              to pay with finance, so we&apos;ve partnered with established
              credit brokers, Ideal4Finance, to enable you to spread the cost
              with monthly payments.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={APPLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 md:px-8 py-4 rounded-full bg-[#c5eb02] text-black text-sm font-bold hover:bg-[#c5eb02]/80 transition-all shadow-xl shadow-zinc-900/10"
              >
                Apply Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
              <a
                href="#calculator"
                className="inline-flex items-center justify-center gap-2 px-6 md:px-8 py-4 rounded-full border border-white/30 text-white text-sm font-bold hover:border-[#c5eb02] hover:text-[#c5eb02] transition-all"
              >
                <Calculator className="w-4 h-4" />
                Calculate Repayments
              </a>
            </div>
          </div>
        </section>

        {/* Calculator */}
        <section id="calculator" className="py-12 lg:py-24 scroll-mt-24">
          <div className="mx-auto max-w-2xl px-6">
            <h2 className="text-[1.625rem] md:text-[2.5rem] font-bold leading-[1.2] text-white mb-4 text-center">
              Calculate your repayments
            </h2>
            <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto text-center">
              Enter a purchase price to see estimated monthly repayments
              across our available finance options.
            </p>
            <FinanceCalculator />
          </div>
        </section>

        {/* Options */}
        <section className="py-12 lg:py-24">
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="text-[1.625rem] md:text-[2.5rem] font-bold leading-[1.2] text-white mb-8">
              Your finance options
            </h2>
            <p className="text-white/70 text-lg mb-6 max-w-2xl">
              The following options are available, always subject to the
              lender&apos;s assessment:
            </p>
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              {FINANCE_OPTIONS.map((option) => (
                <div
                  key={option.rate}
                  className="rounded-xl bg-white/5 border border-white/10 px-6 py-5"
                >
                  <p className="text-xl font-bold text-[#c5eb02] mb-1">
                    {option.rate}
                  </p>
                  <p className="text-white/70 text-sm">
                    over {option.terms}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-white/70 text-lg mb-8 max-w-2xl">
              A deposit might be payable, and we will agree this before you
              begin your application.
            </p>
            <p className="text-white/70 leading-relaxed">
              Ideal4Finance help thousands of people secure finance for their
              purchases. They use only reputable lenders and are
              Trustpilot-rated &lsquo;Excellent&rsquo;. You can apply online
              anytime, and decisions are made quickly. The final decision is
              based on your individual circumstances, including your personal
              credit profile, how much you want to borrow and the loan
              period.
            </p>
          </div>
        </section>

        {/* Representative example */}
        <section className="py-12 lg:py-24 border-t border-[#c5eb02]">
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="text-[1.625rem] md:text-[2.5rem] font-bold leading-[1.2] text-white mb-4">
              Representative example
            </h2>
            <p className="text-white/70 text-lg mb-8 max-w-2xl">
              Here is a representative example of a £5,000 purchase made over
              5 years with a 25% deposit:
            </p>
            <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
              {EXAMPLE_ROWS.map((row, idx) => (
                <div
                  key={row.label}
                  className={`flex items-center justify-between px-6 py-4 ${
                    idx !== EXAMPLE_ROWS.length - 1
                      ? "border-b border-white/10"
                      : ""
                  }`}
                >
                  <span className="text-white/70 text-sm">{row.label}</span>
                  <span className="text-white font-semibold">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Risk warning + disclaimer */}
        <section className="py-12 lg:py-24 border-t border-[#c5eb02]">
          <div className="mx-auto max-w-4xl px-6 space-y-6">
            <div className="flex gap-4 rounded-xl bg-white/5 border border-white/10 px-6 py-5">
              <ShieldAlert className="h-6 w-6 flex-shrink-0 text-[#c5eb02]" />
              <p className="text-white/70 text-sm leading-relaxed">
                There are risks involved in taking out a loan and you should
                ensure you can make all payments on time and in full; failure
                to do so can lead to financial difficulties and have a
                negative impact on your credit score.
              </p>
            </div>

            <p className="text-lg text-white/70 leading-relaxed">
              If you&apos;re ready to apply, please{" "}
              <a
                href={APPLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#c5eb02] font-bold hover:text-[#c5eb02]/80"
              >
                click here to begin the application process
              </a>
              . If you need support with your application, please call
              Ideal4Finance on{" "}
              <a
                href="tel:+442036174647"
                className="text-[#c5eb02] font-bold hover:text-[#c5eb02]/80"
              >
                020 3617 4647
              </a>{" "}
              (Mon to Fri, 9am to 5pm).
            </p>

            <p className="text-white/50 text-xs leading-relaxed pt-6 border-t border-white/10">
              Greentek Energy Ltd is an Introducer Appointed Representative
              of Ideal Sales Solutions Ltd, t/a Ideal4Finance. Ideal Sales
              Solutions Ltd is a credit broker and not a lender (FRN 703401).
              Finance available subject to status. The rate offered is
              always provisional and will depend upon your personal
              circumstances, the loan amount and the term.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
