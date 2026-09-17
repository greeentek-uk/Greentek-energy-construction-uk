"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

/**
 * The browser half of the Lead, fired on arrival at the thank-you page.
 *
 * It reuses the event id the form sent with the enquiry — the server already
 * reported the Lead to Meta with that id, so the two are counted as one. It
 * only fires when that id is present, so someone who opens this URL directly,
 * or refreshes it, doesn't register a lead that never happened.
 */
export default function LeadConversion({ eventId }: { eventId: string | null }) {
  useEffect(() => {
    if (!eventId || !/^[A-Za-z0-9-]{8,64}$/.test(eventId)) return;

    const key = `lead-tracked:${eventId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Storage blocked — still track once for this page view.
    }

    track("Lead", {}, { eventId, server: false });
  }, [eventId]);

  return null;
}
