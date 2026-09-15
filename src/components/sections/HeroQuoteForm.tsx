"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import {
  serviceOptions,
  submitQuoteRequest,
  isLikelyPostcode,
} from "@/lib/quoteForm";

/**
 * The hero's quote form, split across two steps.
 *
 * Step one asks only what someone can answer without thinking — which job,
 * where, and two one-tap qualifiers. Step two asks for contact details, which
 * is the part people hesitate over. Putting the easy half first means the
 * commitment is already made by the time the harder half appears.
 *
 * Posts to the same endpoint as the full form further down the page; `source`
 * distinguishes them in the inbox.
 */
const fieldClass =
  "w-full px-4 py-3 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 focus:border-[#c5eb02] focus:ring-4 focus:ring-[#c5eb02]/10 transition-all outline-none font-medium text-white placeholder:text-white/60 text-sm";

export default function HeroQuoteForm({
  heading,
  subheading,
}: {
  heading: string;
  subheading: string;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    service: "",
    postcode: "",
    property_type: "" as "" | "residential" | "commercial",
    is_homeowner: "" as "" | "yes" | "no",
    message: "",
    full_name: "",
    email: "",
    phone: "",
    consent: false,
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  function setPropertyType(value: "residential" | "commercial") {
    setForm((prev) => ({
      ...prev,
      property_type: prev.property_type === value ? "" : value,
      // "Are you the homeowner?" is meaningless for a commercial site, so the
      // question is hidden below and any previous answer is dropped rather
      // than submitted alongside a contradictory property type.
      is_homeowner: value === "commercial" ? "" : prev.is_homeowner,
    }));
    setError(null);
  }

  function goToStepTwo() {
    if (!form.service) return setError("Pick the service you need.");
    if (!form.postcode.trim()) return setError("Enter your postcode.");
    if (!isLikelyPostcode(form.postcode)) return setError("That postcode doesn't look right.");
    setError(null);
    setStep(2);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.full_name.trim()) return setError("Enter your name.");
    if (!form.email.trim()) return setError("Enter your email.");
    if (!form.phone.trim()) return setError("Enter your phone number.");
    if (!form.consent) return setError("Please tick the consent box so we can reply.");

    setStatus("submitting");
    setError(null);
    try {
      await submitQuoteRequest({ ...form, source: "Homepage hero" });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl bg-black/50 backdrop-blur-md border border-[#c5eb02]/40 p-7 text-center">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-[#c5eb02]">
          <Check className="h-6 w-6 text-black" />
        </div>
        <h2 className="text-xl font-bold text-white">Thanks — that&apos;s with us</h2>
        <p className="mt-2 text-sm text-white/70 leading-relaxed">
          We&apos;ll come back to you within one business day with a plan and a real quote.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-black/50 backdrop-blur-md border border-white/20 p-6 sm:p-7">
      <div className="mb-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 className="text-xl sm:text-2xl font-bold text-white">{heading}</h2>
          <span className="shrink-0 text-xs font-semibold text-white/60 tabular-nums">
            Step {step} of 2
          </span>
        </div>
        <p className="text-sm text-white/70">{subheading}</p>

        <div className="mt-4 flex gap-1.5" aria-hidden>
          <span className="h-1 flex-1 rounded-full bg-[#c5eb02]" />
          <span
            className={`h-1 flex-1 rounded-full transition-colors ${
              step === 2 ? "bg-[#c5eb02]" : "bg-white/25"
            }`}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-3">
        {step === 1 ? (
          <>
            <div>
              <label htmlFor="hero_service" className="sr-only">
                Service needed
              </label>
              <select
                id="hero_service"
                value={form.service}
                onChange={(e) => set("service", e.target.value)}
                className={`${fieldClass} appearance-none`}
              >
                {serviceOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-[#101314]">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="hero_postcode" className="sr-only">
                Postcode
              </label>
              <input
                id="hero_postcode"
                value={form.postcode}
                onChange={(e) => set("postcode", e.target.value)}
                placeholder="Your postcode"
                autoComplete="postal-code"
                className={fieldClass}
              />
            </div>

            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-bold text-white ml-1">Property type</span>
              <div className="flex gap-2">
                {(["residential", "commercial"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPropertyType(value)}
                    aria-pressed={form.property_type === value}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase transition-all border ${
                      form.property_type === value
                        ? "bg-[#c5eb02] text-black border-[#c5eb02]"
                        : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                    }`}
                  >
                    {value === "residential" ? "Residential" : "Commercial"}
                  </button>
                ))}
              </div>
            </div>

            {form.property_type !== "commercial" && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-white ml-1">
                  Are you the homeowner?
                </span>
                <div className="flex gap-2">
                  {(["yes", "no"] as const).map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        set("is_homeowner", form.is_homeowner === value ? "" : value)
                      }
                      aria-pressed={form.is_homeowner === value}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase transition-all border ${
                        form.is_homeowner === value
                          ? "bg-[#c5eb02] text-black border-[#c5eb02]"
                          : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                      }`}
                    >
                      {value === "yes" ? "Yes" : "No"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="hero_message" className="text-xs font-bold text-white ml-1">
                How can we help?
              </label>
              <textarea
                id="hero_message"
                rows={3}
                value={form.message}
                onChange={(e) => set("message", e.target.value)}
                placeholder="Tell us about your project… (optional)"
                className={`${fieldClass} resize-none`}
              />
            </div>

            <button
              type="button"
              onClick={goToStepTwo}
              className="w-full rounded-xl bg-[#c5eb02] px-5 py-3.5 text-sm font-bold text-black transition active:scale-[.98] hover:bg-[#c5eb02]/90 flex items-center justify-center gap-2 mt-1"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <div>
              <label htmlFor="hero_name" className="sr-only">
                Full name
              </label>
              <input
                id="hero_name"
                value={form.full_name}
                onChange={(e) => set("full_name", e.target.value)}
                placeholder="Full name"
                autoComplete="name"
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="hero_email" className="sr-only">
                Email
              </label>
              <input
                id="hero_email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="Email address"
                autoComplete="email"
                className={fieldClass}
              />
            </div>
            <div>
              <label htmlFor="hero_phone" className="sr-only">
                Phone
              </label>
              <input
                id="hero_phone"
                type="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="Phone number"
                autoComplete="tel"
                className={fieldClass}
              />
            </div>

            <label className="flex items-start gap-2.5 text-xs text-white/70 leading-relaxed pt-1">
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(e) => set("consent", e.target.checked)}
                className="mt-0.5 accent-[#c5eb02] h-4 w-4 shrink-0"
              />
              <span>
                I&apos;m happy for Greentek to contact me about this enquiry.
              </span>
            </label>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => { setStep(1); setError(null); }}
                className="rounded-xl border border-white/25 px-4 py-3.5 text-sm font-semibold text-white/80 hover:text-white hover:border-white/40 transition flex items-center gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                type="submit"
                disabled={status === "submitting"}
                className="flex-1 rounded-xl bg-[#c5eb02] px-5 py-3.5 text-sm font-bold text-black transition active:scale-[.98] hover:bg-[#c5eb02]/90 disabled:opacity-60"
              >
                {status === "submitting" ? "Sending…" : "Get my free quote"}
              </button>
            </div>
          </>
        )}

        {error && (
          <p role="alert" className="text-xs font-medium text-red-300 pt-1">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
