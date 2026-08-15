"use client";

import { useEffect, useRef, useState } from "react";

function useFadeIn(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return { ref, visible };
}

const checklist = [
  "Free professional site survey",
  "Tailored savings estimate within 24 hours",
  "Hassle-free grant & finance guidance",
  "Written warranty on every completed job",
];

const contactDetails = [
  {
    label: "0333 533 4567",
    href: "tel:+443335334567",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        />
      </svg>
    ),
  },
  {
    label: "info@greentekenergy.co.uk",
    href: "mailto:info@greentekenergy.co.uk",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    label: "6060 Knights Court, Birmingham Business Park, Solihull, B37 7WY",
    href: "https://maps.google.com",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
];

const serviceOptions = [
  { value: "", label: "Select a service" },
  { value: "solar_storage", label: "Solar PV & Battery Storage" },
  { value: "heating_boiler", label: "Heating & Boiler Upgrades" },
  { value: "insulation", label: "Insulation" },
  { value: "refurb_extension", label: "Property Refurbishment & Extensions" },
  { value: "commercial", label: "Commercial Refurbishment & Maintenance" },
  { value: "not_sure", label: "Not Sure — Need Advice" },
];

const timelineOptions = [
  { value: "", label: "Select a timeframe" },
  { value: "asap", label: "As soon as possible" },
  { value: "3_months", label: "Within 3 months" },
  { value: "researching", label: "Just researching" },
];

type FormState = {
  full_name: string;
  email: string;
  phone: string;
  postcode: string;
  service: string;
  property_type: "residential" | "commercial" | "";
  is_homeowner: "yes" | "no" | "";
  timeline: string;
  message: string;
  consent: boolean;
};

const inputClasses =
  "w-full px-5 py-3.5 rounded-xl bg-white/20 backdrop-blur-sm border border-transparent focus:border-[#c5eb02] focus:ring-4 focus:ring-[#c5eb02]/10 transition-all outline-none font-medium text-white placeholder:text-white/60 text-sm";

const labelClasses = "text-xs font-bold text-white ml-1";

interface CtaSectionProps {
  eyebrow?: string;
  heading?: string;
  description?: string;
  defaultService?: string;
}

export default function CtaSection({
  eyebrow = "Get In Touch",
  heading = "Get a free quote",
  description = "Solar, heating, insulation, or a full refurb, tell us what you're looking at and we'll come back within one business day with a straight answer, a plan and a real quote.",
  defaultService = "",
}: CtaSectionProps) {
  const contentFade = useFadeIn(0);
  const formFade = useFadeIn(150);

  const initialState: FormState = {
    full_name: "",
    email: "",
    phone: "",
    postcode: "",
    service: defaultService,
    property_type: "",
    is_homeowner: "",
    timeline: "",
    message: "",
    consent: false,
  };

  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { id, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [id]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [id]: value }));
    }
  }

  function handlePropertyType(value: FormState["property_type"]) {
    setForm((prev) => ({ ...prev, property_type: value }));
  }

  function handleHomeowner(value: FormState["is_homeowner"]) {
    setForm((prev) => ({ ...prev, is_homeowner: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.consent) {
      setStatus("error");
      return;
    }

    setStatus("submitting");

    try {
      const res = await fetch("/api/quote-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Request failed");

      setStatus("success");
      setForm(initialState);
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  return (
    <section className="py-12 md:py-16 lg:py-24">
      <div className="relative mx-auto max-w-7xl bg-[url('/images/form-bg.avif')] rounded-xl bg-cover bg-center overflow-hidden">
        <div className="absolute inset-0 bg-black/70 rounded-xl" />
        <div className="relative z-10 grid lg:grid-cols-12 gap-10 p-6 sm:p-10 md:p-14">
          {/* Left: copy + checklist + contact */}
          <div
            ref={contentFade.ref}
            className={`lg:col-span-6 flex flex-col justify-center transition-all duration-1000 ease-out ${
              contentFade.visible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            <p className="text-[10px] md:text-[16px] font-semibold uppercase mb-6 bg-[#28282C] text-[#c5eb02] rounded-2xl px-3 py-1 w-fit text-center">
              {eyebrow}
            </p>
            <h2 className="text-[1.625rem] md:text-[2.5rem] font-bold leading-[1.2] text-white mb-4">
              {heading}
            </h2>
            <p className="text-white/70 text-base md:text-lg leading-relaxed mb-8 max-w-md">
              {description}
            </p>

            {/* <ul className="space-y-3 mb-8">
              {checklist.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                >
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                  <span className="text-sm font-medium text-white/90">
                    {item}
                  </span>
                </li>
              ))}
            </ul> */}

            <div className="flex flex-col gap-3">
              {contactDetails.map((detail) => (
                <a
                  key={detail.label}
                  href={detail.href}
                  className="flex items-center gap-3 text-white/80 hover:text-white transition-colors text-sm font-medium"
                >
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    {detail.icon}
                  </span>
                  {detail.label}
                </a>
              ))}
            </div>
          </div>

          {/* Right: form card */}
          <div
            ref={formFade.ref}
            className={`lg:col-span-6 bg-black/50 backdrop-blur-sm border border-white/50 rounded-xl p-6 sm:p-8 shadow-2xl transition-all duration-1000 ease-out ${
              formFade.visible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Name + Email */}
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label htmlFor="full_name" className={labelClasses}>
                    Full name
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    autoComplete="name"
                    required
                    value={form.full_name}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="Jane Smith"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email" className={labelClasses}>
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    autoComplete="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="jane@email.com"
                  />
                </div>
              </div>

              {/* Phone + Postcode */}
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label htmlFor="phone" className={labelClasses}>
                    Phone number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    autoComplete="tel"
                    required
                    value={form.phone}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="07000 000000"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="postcode" className={labelClasses}>
                    Property postcode
                  </label>
                  <input
                    type="text"
                    id="postcode"
                    name="postcode"
                    autoComplete="postal-code"
                    required
                    value={form.postcode}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="B37 7WY"
                  />
                </div>
              </div>

              {/* Service interested in */}
              <div className="space-y-1.5">
                <label htmlFor="service" className={labelClasses}>
                  Service interested in
                </label>
                <select
                  id="service"
                  name="service"
                  required
                  value={form.service}
                  onChange={handleChange}
                  className={`${inputClasses} appearance-none cursor-pointer [&>option]:text-black`}
                >
                  {serviceOptions.map((opt) => (
                    <option
                      key={opt.value}
                      value={opt.value}
                      disabled={opt.value === ""}
                    >
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Property type + Homeowner */}
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <span className={labelClasses}>Property type</span>
                  <div className="flex gap-2">
                    {(["residential", "commercial"] as const).map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => handlePropertyType(val)}
                        className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase transition-all border ${
                          form.property_type === val
                            ? "bg-[#c5eb02] text-black border-[#c5eb02]"
                            : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                        }`}
                      >
                        {val === "residential" ? "Residential" : "Commercial"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className={labelClasses}>Are you the homeowner?</span>
                  <div className="flex gap-2">
                    {(["yes", "no"] as const).map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => handleHomeowner(val)}
                        className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase transition-all border ${
                          form.is_homeowner === val
                            ? "bg-[#c5eb02] text-black border-[#c5eb02]"
                            : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                        }`}
                      >
                        {val === "yes" ? "Yes" : "No"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-1.5">
                <label htmlFor="timeline" className={labelClasses}>
                  When are you looking to start?
                </label>
                <select
                  id="timeline"
                  name="timeline"
                  value={form.timeline}
                  onChange={handleChange}
                  className={`${inputClasses} appearance-none cursor-pointer [&>option]:text-black`}
                >
                  {timelineOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label htmlFor="message" className={labelClasses}>
                  How can we help?
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={3}
                  value={form.message}
                  onChange={handleChange}
                  className={inputClasses.replace("py-3.5", "py-4")}
                  placeholder="Tell us about your solar, heating, insulation, or renovation project... (optional)"
                />
              </div>

              {/* Consent */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  id="consent"
                  name="consent"
                  required
                  checked={form.consent}
                  onChange={handleChange}
                  className="mt-0.5 w-4 h-4 rounded border-white/30 bg-white/20 accent-[#c5eb02] cursor-pointer flex-shrink-0"
                />
                <span className="text-xs text-white/70 leading-relaxed">
                  I agree to be contacted by Greentek Energy Ltd about my
                  enquiry by phone, email, or text.
                </span>
              </label>

              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full py-4 rounded-xl bg-[#c5eb02] text-black font-black text-md hover:bg-[#c5eb02] transition-all duration-500 shadow-xl shadow-zinc-900/10 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {status === "submitting" ? "Sending..." : "Send My Request"}
              </button>

              {status === "success" && (
                <p className="text-xs font-bold text-[#c5eb02] text-center">
                  Thanks — we&apos;ll be in touch within one business day.
                </p>
              )}
              {status === "error" && !form.consent && (
                <p className="text-xs font-bold text-red-600 text-center">
                  Please confirm consent to be contacted before submitting.
                </p>
              )}
              {status === "error" && form.consent && (
                <p className="text-xs font-bold text-red-600 text-center">
                  Something went wrong. Please try again or call us directly.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
