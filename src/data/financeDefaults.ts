import type { FinanceProviderContent } from "./pageContent";

/**
 * Starting content for the two finance provider blocks — used by the seed
 * script and the one-off write that created them. After that the panel owns
 * them (Pages → Finance).
 *
 * Regulatory wording is copied, not written: Ideal4Finance's from the finance
 * page as it stood, Phoenix's disclosure exactly as Greentek supplied it
 * (2026-10-06), and Phoenix's risk and credit-search lines from their own home
 * improvement finance page. Phoenix publishes no rates or representative
 * example, so none are given for them here.
 */
export const FINANCE_PROVIDER_DEFAULTS: Record<
  "finance-ideal4finance" | "finance-phoenix",
  FinanceProviderContent
> = {
  "finance-ideal4finance": {
    name: "Ideal4Finance",
    logo: "https://res.cloudinary.com/mftknsh0/image/upload/v1789582895/greentek/wepkmc9lqqcivdvpmoig.png",
    logoAlt: "Ideal4Finance",
    heading: "Spread the cost with Ideal4Finance",
    intro:
      "Ideal4Finance are established credit brokers who help thousands of people secure finance for their purchases, so you can spread the cost of your project with monthly payments.",
    features: [
      "0% APR options over 3, 6, 12 or 24 months",
      "Longer terms up to 120 months",
      "Apply online at any time, with quick decisions",
      "Uses only reputable lenders and is Trustpilot-rated 'Excellent'",
    ],
    howItWorks:
      "Apply online whenever suits you. The final decision is based on your individual circumstances, including your personal credit profile, how much you want to borrow and the loan period. A deposit might be payable, and we will agree this before you begin your application.",
    applyLabel: "Apply Now",
    applyUrl: "https://ideal4finance.com/loan-apply/grntekener",
    secondaryLabel: "Calculate repayments",
    secondaryUrl: "#calculator",
    supportText: "If you need support with your application, call Ideal4Finance (Mon to Fri, 9am to 5pm).",
    phone: "020 3617 4647",
    riskWarning:
      "There are risks involved in taking out a loan and you should ensure you can make all payments on time and in full; failure to do so can lead to financial difficulties and have a negative impact on your credit score.",
    disclosure:
      "Greentek Energy Ltd is an Introducer Appointed Representative of Ideal Sales Solutions Ltd, t/a Ideal4Finance. Ideal Sales Solutions Ltd is a credit broker and not a lender (FRN 703401). Finance available subject to status. The rate offered is always provisional and will depend upon your personal circumstances, the loan amount and the term.",
  },
  "finance-phoenix": {
    name: "Phoenix Financial Consultants",
    logo: "/images/finance/phoenix-logo.png",
    logoAlt: "Phoenix Financial Consultants",
    heading: "Home improvement finance with Phoenix",
    intro:
      "Phoenix Financial Consultants is a credit broker that introduces loans from its panel of lenders, so you can spread the cost of your solar, heating, insulation or renovation project with monthly payments.",
    features: [
      "Loans from Phoenix's panel of lenders",
      "Apply online using the link in your Greentek quote",
      "Work out repayments with Phoenix's loan calculator",
      "All finance subject to status and credit checks",
    ],
    howItWorks:
      "Ask about finance when you request your quote. Your quote email from Greentek will contain a link to Phoenix's website, where you can complete your application online.",
    applyLabel: "Request a quote with finance",
    applyUrl: "/contact",
    secondaryLabel: "Phoenix loan calculator",
    secondaryUrl: "https://www.phoenix-fc.co.uk/finance_home_improvement",
    supportText: "",
    phone: "",
    riskWarning:
      "Borrowing more than you can afford or paying late may adversely affect your financial status and ability to obtain credit.\n\nThe lender will perform a hard search on your credit file.",
    disclosure:
      "Greentek Energy Ltd is an Introducer Appointed Representative (Financial Services Register No. 1057432) of Phoenix Financial Consultants Limited (Phoenix). Phoenix is a credit broker, not a lender. Phoenix is authorised and regulated by the Financial Conduct Authority (FRN: 539195), and offers finance from its panel of lenders. All finance subject to status and credit checks.",
  },
};
