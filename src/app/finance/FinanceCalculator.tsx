"use client";

import { useMemo, useState } from "react";

interface RateOption {
  key: string;
  label: string;
  rate: number;
  terms: number[];
  financeType: string;
}

/** Mirrors Ideal4Finance's own calculator config/formula for this account (ratesData + the amortization formula from their retail/calculator page), so results match theirs exactly. */
const RATE_OPTIONS: RateOption[] = [
  { key: "0.00", label: "0% APR", rate: 0, terms: [3, 6, 12, 24], financeType: "Interest Free" },
  { key: "11.90", label: "11.9% APR", rate: 11.9, terms: [36, 48, 60], financeType: "Interest Bearing" },
  { key: "10.90", label: "10.9% APR", rate: 10.9, terms: [120], financeType: "Interest Bearing" },
];

function formatCurrency(value: number): string {
  return `£${value.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-white/5">
      <span className="text-white/60 text-sm">{label}</span>
      <span className={`font-bold ${highlight ? "text-[#c5eb02] text-lg" : "text-white"}`}>
        {value}
      </span>
    </div>
  );
}

export default function FinanceCalculator() {
  const [rateKey, setRateKey] = useState(RATE_OPTIONS[0].key);
  const [price, setPrice] = useState("");
  const [deposit, setDeposit] = useState("");
  const [term, setTerm] = useState<number | "">("");

  const selectedRate = RATE_OPTIONS.find((r) => r.key === rateKey) ?? RATE_OPTIONS[0];

  function handleRateChange(key: string) {
    setRateKey(key);
    setTerm("");
  }

  const priceValue = parseFloat(price);
  const depositValue = parseFloat(deposit);
  const amountOfCredit =
    !isNaN(priceValue) && priceValue > 0
      ? Math.max(priceValue - (isNaN(depositValue) ? 0 : depositValue), 0)
      : 0;

  const result = useMemo(() => {
    if (!amountOfCredit || !term) return null;
    const loanTerm = Number(term);
    const monthlyInterestRate = selectedRate.rate / 100 / 12;

    let monthlyRepayment: number;
    let totalPayable: number;
    if (selectedRate.rate === 0) {
      monthlyRepayment = amountOfCredit / loanTerm;
      totalPayable = amountOfCredit;
    } else {
      monthlyRepayment =
        (amountOfCredit * monthlyInterestRate) /
        (1 - Math.pow(1 + monthlyInterestRate, -loanTerm));
      totalPayable = monthlyRepayment * loanTerm;
    }

    return {
      monthlyRepayment,
      totalPayable,
      interestPaid: totalPayable - amountOfCredit,
    };
  }, [amountOfCredit, term, selectedRate]);

  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-6 md:p-8">
      <div className="grid grid-cols-3 gap-2 mb-6">
        {RATE_OPTIONS.map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={() => handleRateChange(r.key)}
            aria-pressed={rateKey === r.key}
            className={`rounded-xl px-3 py-3 text-sm font-bold border transition-all ${
              rateKey === r.key
                ? "bg-[#c5eb02] text-black border-[#c5eb02]"
                : "bg-white/5 text-white border-white/20 hover:bg-white/10"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="calc-price" className="block text-xs font-bold text-white/80 mb-1.5 ml-1">
            Purchase price
          </label>
          <input
            id="calc-price"
            type="number"
            inputMode="decimal"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 5000"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
          />
        </div>
        <div>
          <label htmlFor="calc-deposit" className="block text-xs font-bold text-white/80 mb-1.5 ml-1">
            Deposit (optional)
          </label>
          <input
            id="calc-deposit"
            type="number"
            inputMode="decimal"
            min="0"
            value={deposit}
            onChange={(e) => setDeposit(e.target.value)}
            placeholder="e.g. 1250"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
          />
        </div>
      </div>

      <div className="mb-6">
        <span className="block text-xs font-bold text-white/80 mb-1.5 ml-1">Loan term</span>
        <div className="flex flex-wrap gap-2">
          {selectedRate.terms.map((months) => (
            <button
              key={months}
              type="button"
              onClick={() => setTerm(months)}
              aria-pressed={term === months}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                term === months
                  ? "bg-[#c5eb02] text-black border-[#c5eb02]"
                  : "bg-white/5 text-white border-white/20 hover:bg-white/10"
              }`}
            >
              {months} months
            </button>
          ))}
        </div>
      </div>

      {result ? (
        <div className="space-y-2">
          <Row label="Amount of credit" value={formatCurrency(amountOfCredit)} />
          <Row label="Monthly repayment" value={formatCurrency(result.monthlyRepayment)} highlight />
          <Row label="Total repayable" value={formatCurrency(result.totalPayable)} />
          <Row label="Interest paid" value={formatCurrency(result.interestPaid)} />
          <Row label="APR" value={`${selectedRate.label} (${selectedRate.financeType})`} />
        </div>
      ) : (
        <p className="text-white/50 text-sm px-1">
          Enter a purchase price and select a loan term to see your estimated repayments.
        </p>
      )}

      <p className="text-white/40 text-xs mt-6 leading-relaxed">
        This calculator provides a guide only. The exact amounts will be confirmed during the
        application process, subject to status and lender assessment.
      </p>
    </div>
  );
}
