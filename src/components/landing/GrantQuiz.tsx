"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  CalendarClock,
  CalendarDays,
  Check,
  CircleQuestionMark,
  Droplet,
  Fan,
  Flame,
  Fuel,
  House,
  KeyRound,
  Lock,
  Warehouse,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { newEventId, setAdsUserData, track } from "@/lib/analytics";
import {
  currentHeatingOptions,
  homeTypeOptions,
  isLikelyEmail,
  isLikelyPostcode,
  isLikelyUkPhone,
  ownerOptions,
  submitQuoteRequest,
  suggestEmail,
  timelineOptions,
} from "@/lib/quoteForm";

/**
 * The heat pump landing page's hero form: four tap-a-tile questions, then the
 * postcode, then contact details (2026-11-04).
 *
 * Why it exists beside `HeroQuoteForm`: after Aira, British Gas, Octopus and
 * E.ON Next entered the heat pump auction, their pages out-converted ours.
 * All of them ask almost nothing first — Aira one tap on a picture tile,
 * Octopus a postcode — and the question is *on the page*, not behind a
 * button. Ours opened a pop-up with two dropdowns and a postcode before
 * anything moved. So here a tap is the whole first step: each answer moves
 * straight to the next question, there's no Continue until the postcode, and
 * contact details still come last, once someone has invested in the rest.
 *
 * Same questions and option lists as `HeroQuoteForm heatPump` (`lib/quoteForm`)
 * so the email's grant check (`lib/grantCheck.ts`) and the inbox see no
 * difference — except "main reason", left out to keep it to four taps (the
 * API treats it as optional). Photos are left to the call for the same reason.
 *
 * It never tells the visitor whether they qualify: the grant check is for
 * sorting the inbox, and the survey decides (see `grantCheck.ts`).
 *
 * Light card, because it sits over the hero photo on a light page; the
 * pop-up form elsewhere on the page stays as it is.
 */

type Option = { value: string; label: string };

const HEATING_ICONS: Record<string, LucideIcon> = {
  gas: Flame,
  oil: Droplet,
  lpg: Fuel,
  electric: Zap,
  heat_pump: Fan,
  other: CircleQuestionMark,
};

const HOME_ICONS: Record<string, LucideIcon> = {
  detached: House,
  semi: Warehouse,
  terraced: Building2,
  bungalow: House,
  flat: Building2,
  other: CircleQuestionMark,
};

const OWNER_ICONS: Record<string, LucideIcon> = { yes: Check, no: X, buying: KeyRound };

const TIMELINE_ICONS: Record<string, LucideIcon> = {
  asap: CalendarClock,
  "1_3_months": CalendarDays,
  "3_6_months": Calendar,
};

type QuestionKey = "current_heating" | "home_type" | "is_homeowner" | "timeline";

const QUESTIONS: { key: QuestionKey; title: string; options: Option[]; icons: Record<string, LucideIcon> }[] = [
  { key: "current_heating", title: "How do you heat your home now?", options: currentHeatingOptions, icons: HEATING_ICONS },
  { key: "home_type", title: "What type of home is it?", options: homeTypeOptions, icons: HOME_ICONS },
  { key: "is_homeowner", title: "Do you own the home?", options: ownerOptions, icons: OWNER_ICONS },
  {
    key: "timeline",
    title: "When would you like it fitted?",
    // The list's first entry is a dropdown placeholder.
    options: timelineOptions.filter((o) => o.value),
    icons: TIMELINE_ICONS,
  },
];

const POSTCODE_STEP = QUESTIONS.length;
const DETAILS_STEP = QUESTIONS.length + 1;
const TOTAL_STEPS = QUESTIONS.length + 2;

const fieldClass =
  "w-full min-h-12 rounded-xl border border-black/15 bg-white px-4 py-3 text-base font-medium text-[#0b0d0e] outline-none transition placeholder:text-black/40 focus:border-[#0b0d0e] focus:ring-4 focus:ring-[#c5eb02]/40 sm:text-sm";

const primaryButton =
  "flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#c5eb02] px-5 py-3.5 text-base font-extrabold text-black transition hover:bg-[#d4f53a] active:scale-[.98] disabled:opacity-60";

export default function GrantQuiz({
  heading,
  subheading,
  source,
  service,
  trust,
  idPrefix = "quiz",
  narrow = false,
}: {
  heading: string;
  subheading: string;
  /** Names this form in the enquiry email's "Came from" line and in StartQuote. */
  source: string;
  /** Submitted as `service`, as the page's other forms do. */
  service: string;
  /**
   * The rating badge, shown under the card on every step: Aira puts its
   * reviews right at the form, where people decide whether to go on.
   */
  trust?: React.ReactNode;
  /** Keeps field ids unique when the page shows the quiz twice. */
  idPrefix?: string;
  /** In a narrow column (the closing section): two tiles a row, never three. */
  narrow?: boolean;
}) {
  const router = useRouter();
  const started = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"idle" | "submitting">("idle");
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<QuestionKey, string>>({
    current_heating: "",
    home_type: "",
    is_homeowner: "",
    timeline: "",
  });
  const [details, setDetails] = useState({
    postcode: "",
    full_name: "",
    email: "",
    phone: "",
    address: "",
    consent: false,
  });

  function markStarted() {
    if (started.current) return;
    started.current = true;
    track("StartQuote", { content_name: source });
  }

  function goTo(next: number) {
    setError(null);
    setStep(next);
    // Focus the new question's title so screen readers hear it, without
    // scrolling or popping up a phone keyboard; bring the card back into
    // view if a long step left its top above the screen.
    requestAnimationFrame(() => {
      if ((cardRef.current?.getBoundingClientRect().top ?? 0) < 0) {
        cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      titleRef.current?.focus({ preventScroll: true });
    });
  }

  function pick(key: QuestionKey, value: string) {
    markStarted();
    setAnswers((prev) => ({ ...prev, [key]: value }));
    // A short beat so the tap visibly lands on the tile before it moves on.
    window.setTimeout(() => goTo(step + 1), 180);
  }

  function setDetail<K extends keyof typeof details>(key: K, value: (typeof details)[K]) {
    setDetails((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step === POSTCODE_STEP) {
      if (!details.postcode.trim()) return setError("Enter your postcode.");
      if (!isLikelyPostcode(details.postcode)) return setError("That postcode doesn't look right.");
      return goTo(DETAILS_STEP);
    }
    if (step !== DETAILS_STEP) return;

    if (!details.full_name.trim()) return setError("Enter your name.");
    if (!details.email.trim()) return setError("Enter your email.");
    if (!isLikelyEmail(details.email)) return setError("That email address doesn't look right.");
    if (!details.phone.trim()) return setError("Enter your phone number.");
    if (!isLikelyUkPhone(details.phone)) return setError("Please check your phone number — we'll call you on it.");
    if (!details.address.trim()) return setError("Enter the property's address.");
    if (!details.consent) return setError("Please tick the box so we can reply.");

    setStatus("submitting");
    setError(null);
    // Shared by the server's Lead and the thank-you page's pixel Lead, so
    // Meta counts one enquiry, not two.
    const eventId = newEventId();
    try {
      await submitQuoteRequest({
        ...answers,
        ...details,
        email: details.email.trim(),
        address: details.address.trim(),
        service,
        property_type: "residential",
        source,
        event_id: eventId,
        page_url: window.location.href,
      });
      setAdsUserData({ email: details.email, phone: details.phone });
      router.push(`/thank-you?eid=${encodeURIComponent(eventId)}`);
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  const question = QUESTIONS[step];
  const emailSuggestion = suggestEmail(details.email);
  const errorText = error && (
    <p role="alert" className="text-sm font-semibold text-red-600">
      {error}
    </p>
  );

  return (
    <div
      ref={cardRef}
      className="scroll-mt-24 rounded-3xl bg-white p-5 text-[#0b0d0e] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.45)] sm:p-7"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-heading text-xl font-extrabold leading-tight sm:text-2xl">{heading}</p>
          {subheading && <p className="mt-1 text-sm text-black/60">{subheading}</p>}
        </div>
        <span className="shrink-0 pt-1 text-xs font-bold tabular-nums text-black/50">
          {step + 1} of {TOTAL_STEPS}
        </span>
      </div>

      <div className="mt-4 flex gap-1.5" aria-hidden>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-[#c5eb02]" : "bg-black/10"}`} />
        ))}
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-5">
        <h2 ref={titleRef} tabIndex={-1} className="text-lg font-extrabold outline-none sm:text-xl">
          {question
            ? question.title
            : step === POSTCODE_STEP
              ? "What's your postcode?"
              : "Last step: where can we reach you?"}
        </h2>

        {question && (
          <div
            role="radiogroup"
            aria-label={question.title}
            className={`mt-4 grid gap-2.5 ${
              narrow
                ? question.options.length > 3
                  ? "grid-cols-2"
                  : "grid-cols-1"
                : question.options.length > 4
                  ? "grid-cols-2 sm:grid-cols-3"
                  : "grid-cols-1 sm:grid-cols-3"
            }`}
          >
            {question.options.map((option) => {
              const Icon = question.icons[option.value] ?? CircleQuestionMark;
              const selected = answers[question.key] === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => pick(question.key, option.value)}
                  className={`flex min-h-14 items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-[15px] font-bold transition active:scale-[.98] ${narrow ? "" : "sm:min-h-24 sm:flex-col sm:items-start sm:justify-between"} ${
                    selected
                      ? "border-[#0b0d0e] bg-[#c5eb02]"
                      : "border-black/10 bg-[#f6f7f2] hover:border-black/40"
                  }`}
                >
                  <Icon className="h-6 w-6 shrink-0" strokeWidth={1.75} aria-hidden />
                  <span className="leading-tight">{option.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {step === POSTCODE_STEP && (
          <div className="mt-4 space-y-4">
            <label htmlFor={`${idPrefix}_postcode`} className="sr-only">
              Postcode
            </label>
            <input
              id={`${idPrefix}_postcode`}
              value={details.postcode}
              onChange={(e) => setDetail("postcode", e.target.value.toUpperCase())}
              placeholder="e.g. B1 1AA"
              autoComplete="postal-code"
              autoCapitalize="characters"
              enterKeyHint="next"
              className={fieldClass}
            />
            {errorText}
            <button type="submit" className={primaryButton}>
              Continue
              <ArrowRight className="h-5 w-5" aria-hidden />
            </button>
          </div>
        )}

        {step === DETAILS_STEP && (
          <div className="mt-4 space-y-3">
            <label htmlFor={`${idPrefix}_name`} className="sr-only">
              Full name
            </label>
            <input
              id={`${idPrefix}_name`}
              value={details.full_name}
              onChange={(e) => setDetail("full_name", e.target.value)}
              placeholder="Full name"
              autoComplete="name"
              autoCapitalize="words"
              enterKeyHint="next"
              className={fieldClass}
            />
            <div>
              <label htmlFor={`${idPrefix}_email`} className="sr-only">
                Email
              </label>
              <input
                id={`${idPrefix}_email`}
                type="email"
                inputMode="email"
                value={details.email}
                onChange={(e) => setDetail("email", e.target.value)}
                placeholder="Email address"
                autoComplete="email"
                autoCapitalize="none"
                enterKeyHint="next"
                className={fieldClass}
              />
              {/* A nudge, never an automatic change: an odd domain can be real. */}
              {emailSuggestion && (
                <p className="ml-1 mt-1.5 text-xs text-black/60">
                  Did you mean{" "}
                  <button
                    type="button"
                    onClick={() => setDetail("email", emailSuggestion)}
                    className="font-bold underline underline-offset-2"
                  >
                    {emailSuggestion}
                  </button>
                  ?
                </p>
              )}
            </div>
            <label htmlFor={`${idPrefix}_phone`} className="sr-only">
              Phone
            </label>
            <input
              id={`${idPrefix}_phone`}
              type="tel"
              inputMode="tel"
              value={details.phone}
              onChange={(e) => setDetail("phone", e.target.value)}
              placeholder="Phone number"
              autoComplete="tel"
              enterKeyHint="next"
              className={fieldClass}
            />
            <label htmlFor={`${idPrefix}_address`} className="sr-only">
              Property address
            </label>
            <input
              id={`${idPrefix}_address`}
              value={details.address}
              onChange={(e) => setDetail("address", e.target.value)}
              placeholder={`Property address (${details.postcode.trim()})`}
              autoComplete="street-address"
              autoCapitalize="words"
              enterKeyHint="send"
              className={fieldClass}
            />
            <label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm leading-relaxed text-black/70">
              <input
                type="checkbox"
                checked={details.consent}
                onChange={(e) => setDetail("consent", e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 accent-[#0b0d0e]"
              />
              <span>I&apos;m happy for Greentek to contact me about this enquiry.</span>
            </label>
            {errorText}
            <button type="submit" disabled={status === "submitting"} className={primaryButton}>
              {status === "submitting" ? "Sending…" : "Check my grant"}
              {status !== "submitting" && <ArrowRight className="h-5 w-5" aria-hidden />}
            </button>
            <p className="flex items-center justify-center gap-1.5 text-xs text-black/50">
              <Lock className="h-3.5 w-3.5" aria-hidden />
              Free check, no obligation.
            </p>
          </div>
        )}

        {step > 0 && (
          <button
            type="button"
            onClick={() => goTo(step - 1)}
            className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-black/60 hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back
          </button>
        )}
      </form>

      {trust && <div className="mt-5 border-t border-black/10 pt-4 text-sm font-semibold">{trust}</div>}
    </div>
  );
}
