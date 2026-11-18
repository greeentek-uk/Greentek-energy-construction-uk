"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PhoneCall } from "lucide-react";
import { newEventId, setAdsUserData, track } from "@/lib/analytics";
import { isLikelyPostcode, isLikelyUkPhone, submitQuoteRequest } from "@/lib/quoteForm";

/**
 * "Rather we call you?" — name, phone and postcode, nothing else
 * (2026-11-05, owner: improve conversion "at all cost").
 *
 * The quiz is six screens ending in five fields; some people won't start it
 * but will happily leave a number, and the national firms on the same ads
 * offer nothing in between "fill in our form" and "ring a call centre". This
 * catches them. It's the same enquiry (number, email to the team, Lead to
 * Meta/Google) with `callback: true`, the one case where the API doesn't
 * require an email address — the team calls them back instead of replying.
 */
export default function CallbackForm({ source, service, idPrefix = "cb" }: { source: string; service: string; idPrefix?: string }) {
  const router = useRouter();
  const started = useRef(false);
  const [form, setForm] = useState({ full_name: "", phone: "", postcode: "", consent: false });
  const [status, setStatus] = useState<"idle" | "submitting">("idle");
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    if (!started.current) {
      started.current = true;
      track("StartQuote", { content_name: source });
    }
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.full_name.trim()) return setError("Enter your name.");
    if (!isLikelyUkPhone(form.phone)) return setError("Please check your phone number — we'll call you on it.");
    if (!isLikelyPostcode(form.postcode)) return setError("That postcode doesn't look right.");
    if (!form.consent) return setError("Please tick the box so we can call you.");

    setStatus("submitting");
    const eventId = newEventId();
    try {
      await submitQuoteRequest({
        full_name: form.full_name.trim(),
        phone: form.phone,
        postcode: form.postcode.trim(),
        email: "",
        callback: true,
        message: "Callback request: please call me back.",
        service,
        consent: true,
        source,
        event_id: eventId,
        page_url: window.location.href,
      });
      setAdsUserData({ email: "", phone: form.phone });
      router.push(`/thank-you?eid=${encodeURIComponent(eventId)}`);
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  const field =
    "w-full min-h-12 rounded-xl border border-black/15 bg-white px-4 py-3 text-base font-medium outline-none transition placeholder:text-black/40 focus:border-[#0b0d0e] focus:ring-4 focus:ring-[#c5eb02]/40 sm:text-sm";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label htmlFor={`${idPrefix}_name`} className="sr-only">
          Your name
        </label>
        <input
          id={`${idPrefix}_name`}
          value={form.full_name}
          onChange={(e) => set("full_name", e.target.value)}
          placeholder="Your name"
          autoComplete="name"
          className={field}
        />
        <label htmlFor={`${idPrefix}_phone`} className="sr-only">
          Phone number
        </label>
        <input
          id={`${idPrefix}_phone`}
          type="tel"
          inputMode="tel"
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
          placeholder="Phone number"
          autoComplete="tel"
          className={field}
        />
      </div>
      <label htmlFor={`${idPrefix}_postcode`} className="sr-only">
        Postcode
      </label>
      <input
        id={`${idPrefix}_postcode`}
        value={form.postcode}
        onChange={(e) => set("postcode", e.target.value.toUpperCase())}
        placeholder="Postcode"
        autoComplete="postal-code"
        autoCapitalize="characters"
        className={field}
      />
      <label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm leading-relaxed text-black/70">
        <input
          type="checkbox"
          checked={form.consent}
          onChange={(e) => set("consent", e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 accent-[#0b0d0e]"
        />
        <span>I&apos;m happy for Greentek to call me about this enquiry.</span>
      </label>
      {error && (
        <p role="alert" className="text-sm font-semibold text-red-600">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#0b0d0e] px-5 py-3.5 text-base font-bold text-white transition hover:bg-black active:scale-[.98] disabled:opacity-60"
      >
        <PhoneCall className="h-5 w-5" aria-hidden />
        {status === "submitting" ? "Sending…" : "Call me back"}
      </button>
    </form>
  );
}
