"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { newEventId, track } from "@/lib/analytics";
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";
import {
  budgetOptions,
  heroServiceOptions,
  ownerOptions,
  projectTypeOptions,
  submitQuoteRequest,
  isLikelyPostcode,
  timelineOptions,
  type ProjectType,
} from "@/lib/quoteForm";
import PropertyPhotoPicker, { type EnquiryRef, type PhotoItem } from "./PropertyPhotoPicker";

/**
 * The hero's quote form, split across four short steps.
 *
 * It starts with what someone can answer without thinking (the job), then the
 * property and budget, then optional photos and notes, and asks for contact
 * details last — the part people hesitate over — once they've already
 * invested in the rest.
 *
 * Built to be filled in one-handed on a phone: short choices are large tap
 * targets, longer lists are dropdowns (which open the phone's own picker),
 * the action buttons sit at the bottom within thumb reach, and inputs use 16px
 * text so iOS doesn't zoom in.
 *
 * Posts to the same endpoint as the full form further down the page; `source`
 * distinguishes them in the inbox.
 */
const fieldClass =
  "w-full min-h-12 px-4 py-3 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 focus:border-[#c5eb02] focus:ring-4 focus:ring-[#c5eb02]/10 transition-all outline-none font-medium text-white placeholder:text-white/60 text-base sm:text-sm";

const chipClass = (selected: boolean) =>
  `min-h-11 rounded-xl px-3 py-2 text-xs font-bold transition-all border active:scale-[.98] ${
    selected
      ? "bg-[#c5eb02] text-black border-[#c5eb02]"
      : "bg-white/10 text-white border-white/20 hover:bg-white/20"
  }`;

const primaryButton =
  "flex-1 min-h-12 rounded-xl bg-[#c5eb02] px-5 py-3 text-sm font-bold text-black transition active:scale-[.98] hover:bg-[#c5eb02]/90 disabled:opacity-60 flex items-center justify-center gap-2";

const backButton =
  "min-h-12 rounded-xl border border-white/25 px-4 py-3 text-sm font-semibold text-white/80 hover:text-white hover:border-white/40 transition flex items-center gap-1.5";

/** A labelled dropdown with a placeholder option and a chevron. */
function SelectField({
  id,
  label,
  placeholder,
  options,
  value,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-bold text-white ml-1">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${fieldClass} appearance-none pr-10 ${value ? "" : "text-white/60"}`}
        >
          <option value="" disabled className="bg-[#101314]">
            {placeholder}
          </option>
          {options
            .filter((o) => o.value)
            .map((option) => (
              <option key={option.value} value={option.value} className="bg-[#101314] text-white">
                {option.label}
              </option>
            ))}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70"
        />
      </div>
    </div>
  );
}

const STEP_TITLES = ["What you need", "Property & budget", "Photos & notes", "Your details"] as const;

type Step = 1 | 2 | 3 | 4;

export default function HeroQuoteForm({
  heading,
  subheading,
}: {
  heading: string;
  subheading: string;
}) {
  const router = useRouter();
  const started = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const stepTitleRef = useRef<HTMLParagraphElement>(null);
  const [step, setStep] = useState<Step>(1);
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [enquiry, setEnquiry] = useState<EnquiryRef | null>(null);
  const [form, setForm] = useState({
    // Construction is the default — most enquiries are for building work.
    project_type: "construction" as ProjectType,
    service: "",
    postcode: "",
    property_type: "" as "" | "residential" | "commercial",
    is_homeowner: "",
    timeline: "",
    budget: "",
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

  function setProjectType(value: ProjectType) {
    setForm((prev) => ({
      ...prev,
      project_type: value,
      // A kitchen isn't an energy upgrade: the service is cleared when it
      // doesn't belong to the newly chosen list.
      service: heroServiceOptions[value].some((o) => o.value === prev.service) ? prev.service : "",
    }));
    setError(null);
  }

  /** StartQuote, once per visit to the form — on the first field someone engages with. */
  function markStarted() {
    if (started.current) return;
    started.current = true;
    track("StartQuote", { content_name: "Homepage hero" });
  }

  function goTo(next: Step) {
    setError(null);
    setStep(next);
    // On a phone the new step can start above the screen after scrolling
    // through a long one, so bring the top of the form back into view. Focus
    // moves to the step title (not an input) so the keyboard doesn't pop up.
    requestAnimationFrame(() => {
      const top = cardRef.current?.getBoundingClientRect().top ?? 0;
      if (top < 0) cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      stepTitleRef.current?.focus({ preventScroll: true });
    });
  }

  function continueFromStepOne() {
    if (!form.service) return setError("Pick what you need help with.");
    if (!form.postcode.trim()) return setError("Enter your postcode.");
    if (!isLikelyPostcode(form.postcode)) return setError("That postcode doesn't look right.");
    goTo(2);
  }

  function continueFromStepTwo() {
    if (!form.timeline) return setError("Choose when you'd like to begin.");
    if (!form.budget) return setError("Choose an approximate budget — or “I need guidance”.");
    goTo(3);
  }

  const uploading = photos.some((p) => p.status === "uploading");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Enter on a phone keyboard submits the form from any step.
    if (step === 1) return continueFromStepOne();
    if (step === 2) return continueFromStepTwo();
    if (step === 3) return goTo(4);

    if (!form.full_name.trim()) return setError("Enter your name.");
    if (!form.email.trim()) return setError("Enter your email.");
    if (!form.phone.trim()) return setError("Enter your phone number.");
    if (!form.consent) return setError("Please tick the consent box so we can reply.");
    if (uploading) return setError("Your photos are still uploading — one moment.");

    setStatus("submitting");
    setError(null);
    // Generated before sending so the server's Lead and the thank-you page's
    // pixel Lead carry the same id and Meta counts one enquiry, not two.
    const eventId = newEventId();
    try {
      // project_type is carried in the service value itself (energy_… / construction_…).
      const { project_type, ...fields } = form;
      await submitQuoteRequest({
        ...fields,
        // A photo that failed to upload is left out rather than blocking the enquiry.
        photos: photos.flatMap((p) => (p.status === "done" && p.url ? [p.url] : [])),
        enquiry,
        source: "Homepage hero",
        event_id: eventId,
        page_url: window.location.href,
      });
      router.push(`/thank-you?eid=${encodeURIComponent(eventId)}`);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <div
      ref={cardRef}
      className="scroll-mt-24 rounded-2xl bg-black/50 backdrop-blur-md border border-white/20 p-5 sm:p-7"
    >
      <div className="mb-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 className="text-xl sm:text-2xl font-bold text-white">{heading}</h2>
          <span className="shrink-0 text-xs font-semibold text-white/60 tabular-nums">
            Step {step} of 4
          </span>
        </div>
        <p className="text-sm text-white/70">{subheading}</p>

        <div className="mt-4 flex gap-1.5" aria-hidden>
          {[1, 2, 3, 4].map((n) => (
            <span
              key={n}
              className={`h-1 flex-1 rounded-full transition-colors ${
                n <= step ? "bg-[#c5eb02]" : "bg-white/25"
              }`}
            />
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} onFocusCapture={markStarted} noValidate className="space-y-4">
        <p
          ref={stepTitleRef}
          tabIndex={-1}
          className="text-sm font-bold uppercase tracking-wide text-[#c5eb02] outline-none"
        >
          {STEP_TITLES[step - 1]}
        </p>

        {step === 1 && (
          <>
            {/* Segmented switch: the choice changes the service list below it. */}
            <div
              role="radiogroup"
              aria-label="Type of project"
              className="grid grid-cols-2 gap-1 rounded-xl border border-white/20 bg-white/10 p-1"
            >
              {projectTypeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={form.project_type === option.value}
                  onClick={() => setProjectType(option.value)}
                  className={`min-h-11 rounded-lg text-sm font-bold transition-colors ${
                    form.project_type === option.value
                      ? "bg-[#c5eb02] text-black"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <SelectField
              id="hero_service"
              label="What can we help with?"
              placeholder={
                form.project_type === "energy" ? "Choose an energy upgrade" : "Choose a project"
              }
              options={heroServiceOptions[form.project_type]}
              value={form.service}
              onChange={(value) => set("service", value)}
            />

            <div>
              <label htmlFor="hero_postcode" className="sr-only">
                Postcode
              </label>
              <input
                id="hero_postcode"
                value={form.postcode}
                onChange={(e) => set("postcode", e.target.value.toUpperCase())}
                placeholder="Your postcode"
                autoComplete="postal-code"
                autoCapitalize="characters"
                enterKeyHint="next"
                className={fieldClass}
              />
            </div>

            <button type="button" onClick={continueFromStepOne} className={`${primaryButton} w-full`}>
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <fieldset>
              <legend className="text-xs font-bold text-white ml-1 mb-1.5">Property type</legend>
              <div className="grid grid-cols-2 gap-2">
                {(["residential", "commercial"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => set("property_type", form.property_type === value ? "" : value)}
                    aria-pressed={form.property_type === value}
                    className={chipClass(form.property_type === value)}
                  >
                    {value === "residential" ? "Residential" : "Commercial"}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Asked for commercial sites too: owner, tenant or mid-purchase
                changes who can sign off the work. */}
            <fieldset>
              <legend className="text-xs font-bold text-white ml-1 mb-1.5">
                Are you the property owner?
              </legend>
              <div className="grid grid-cols-2 gap-2">
                {ownerOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      set("is_homeowner", form.is_homeowner === option.value ? "" : option.value)
                    }
                    aria-pressed={form.is_homeowner === option.value}
                    className={`${chipClass(form.is_homeowner === option.value)} ${
                      option.value === "buying" ? "col-span-2" : ""
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <SelectField
              id="hero_timeline"
              label="When would you like to begin?"
              placeholder="Choose a timeframe"
              options={timelineOptions}
              value={form.timeline}
              onChange={(value) => set("timeline", value)}
            />

            <SelectField
              id="hero_budget"
              label="Approximate project investment"
              placeholder="Choose a budget"
              options={budgetOptions}
              value={form.budget}
              onChange={(value) => set("budget", value)}
            />

            <div className="flex gap-2">
              <button type="button" onClick={() => goTo(1)} className={backButton}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button type="button" onClick={continueFromStepTwo} className={primaryButton}>
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <p className="-mt-2 text-xs text-white/60">
              Photos help us understand the job before we call. Both are optional.
            </p>
            <PropertyPhotoPicker photos={photos} onChange={setPhotos} onEnquiry={setEnquiry} />

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

            <div className="flex gap-2">
              <button type="button" onClick={() => goTo(2)} className={backButton}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button type="button" onClick={() => goTo(4)} className={primaryButton}>
                {photos.length || form.message.trim() ? "Continue" : "Skip"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </>
        )}

        {step === 4 && (
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
                autoCapitalize="words"
                enterKeyHint="next"
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
                inputMode="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="Email address"
                autoComplete="email"
                autoCapitalize="none"
                enterKeyHint="next"
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
                inputMode="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="Phone number"
                autoComplete="tel"
                enterKeyHint="send"
                className={fieldClass}
              />
            </div>

            {/* The whole row is the tap target, not just the small box. */}
            <label className="flex min-h-11 cursor-pointer items-start gap-3 text-xs text-white/70 leading-relaxed">
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(e) => set("consent", e.target.checked)}
                className="mt-0.5 accent-[#c5eb02] h-5 w-5 shrink-0"
              />
              <span>I&apos;m happy for Greentek to contact me about this enquiry.</span>
            </label>

            <div className="flex gap-2">
              <button type="button" onClick={() => goTo(3)} className={backButton}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                type="submit"
                disabled={status === "submitting" || uploading}
                className={primaryButton}
              >
                {status === "submitting"
                  ? "Sending…"
                  : uploading
                    ? "Uploading photos…"
                    : "Get my free quote"}
              </button>
            </div>
          </>
        )}

        {error && (
          <p role="alert" className="text-xs font-medium text-red-300">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
