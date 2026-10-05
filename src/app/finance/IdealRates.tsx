import FinanceCalculator from "./FinanceCalculator";

/**
 * Ideal4Finance's published rates, representative example and calculator —
 * moved unchanged from the old single finance page. Only Ideal4Finance
 * publishes figures; Phoenix's page deliberately has no equivalent rather than
 * invented numbers. (The calculator's own rate table lives in FinanceCalculator.)
 */
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

export default function IdealRates() {
  return (
    <>
      <section className="py-10 lg:py-16">
        {/* Centred in the page's one 56rem column — see the provider page. */}
        <div className="site-container">
          <div className="site-prose mx-auto">
          <h2 className="text-[1.625rem] md:text-[2.5rem] font-bold leading-[1.2] text-white mb-4 text-center">
            Your finance options
          </h2>
          <p className="text-white/70 text-lg mb-8 text-center">
            The following options are available, always subject to the lender&apos;s assessment:
          </p>
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            {FINANCE_OPTIONS.map((option) => (
              <div key={option.rate} className="rounded-xl bg-white/5 border border-white/10 px-6 py-5 text-center">
                <p className="text-xl font-bold text-[#c5eb02] mb-1">{option.rate}</p>
                <p className="text-white/70 text-sm">over {option.terms}</p>
              </div>
            ))}
          </div>
          </div>
        </div>
      </section>

      <section className="py-10 lg:py-16">
        <div className="site-container">
          <h2 className="text-[1.625rem] md:text-[2.5rem] font-bold leading-[1.2] text-white mb-4 text-center">
            Representative example
          </h2>
          <p className="text-white/70 text-lg mb-8 text-center">
            Here is a representative example of a £5,000 purchase made over 5 years with a 25% deposit:
          </p>
          <div className="site-prose mx-auto rounded-xl bg-white/5 border border-white/10 overflow-hidden">
            {EXAMPLE_ROWS.map((row, idx) => (
              <div
                key={row.label}
                className={`flex items-center justify-between px-6 py-4 ${
                  idx !== EXAMPLE_ROWS.length - 1 ? "border-b border-white/10" : ""
                }`}
              >
                <span className="text-white/70 text-sm">{row.label}</span>
                <span className="text-white font-semibold">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="calculator" className="py-10 lg:py-16 scroll-mt-24">
        <div className="site-container">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-[1.625rem] md:text-[2.5rem] font-bold leading-[1.2] text-white mb-4 text-center">
              Calculate your repayments
            </h2>
            <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto text-center">
              Enter a purchase price to see estimated monthly repayments across the available options.
            </p>
            <FinanceCalculator />
          </div>
        </div>
      </section>
    </>
  );
}
