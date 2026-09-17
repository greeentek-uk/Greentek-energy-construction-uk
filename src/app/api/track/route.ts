import { NextResponse, after } from "next/server";
import { contextFromRequest, sendCapiEvent } from "@/lib/metaCapi";
import { metaAllowedForRequest } from "@/lib/metaConsent";
import {
  ALLOWED_CUSTOM_DATA_KEYS,
  BROWSER_FORWARDABLE_EVENTS,
  type MetaEventName,
} from "@/lib/metaEvents";

/**
 * Relays browser events to the Meta Conversions API so they're still counted
 * when the pixel itself is blocked (ad blockers, Safari's tracking prevention).
 *
 * This endpoint is public, so it forwards only an allowlist of events and a
 * narrow set of descriptive fields — no personal data is accepted from the
 * browser, and Lead can't be posted here at all.
 */
export async function POST(request: Request): Promise<Response> {
  let body: {
    event_name?: unknown;
    event_id?: unknown;
    event_source_url?: unknown;
    custom_data?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const eventName = String(body.event_name ?? "") as MetaEventName;
  if (!BROWSER_FORWARDABLE_EVENTS.includes(eventName)) {
    return NextResponse.json({ error: "Event not accepted" }, { status: 400 });
  }

  const eventId = String(body.event_id ?? "");
  if (!/^[A-Za-z0-9-]{8,64}$/.test(eventId)) {
    return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
  }

  const sourceUrl =
    typeof body.event_source_url === "string" && /^https?:\/\//.test(body.event_source_url)
      ? body.event_source_url.slice(0, 1000)
      : undefined;

  const customData: Record<string, unknown> = {};
  if (body.custom_data && typeof body.custom_data === "object") {
    for (const key of ALLOWED_CUSTOM_DATA_KEYS) {
      const value = (body.custom_data as Record<string, unknown>)[key];
      if (typeof value === "string") customData[key] = value.slice(0, 200);
      else if (Array.isArray(value)) customData[key] = value.filter((v) => typeof v === "string").slice(0, 20);
    }
  }

  // Checked here as well as in the browser: a visitor who declined isn't sent
  // to Meta whatever the page posts.
  if (!(await metaAllowedForRequest(request))) {
    return NextResponse.json({ ok: true, skipped: "consent" });
  }

  const context = contextFromRequest(request);

  // Respond immediately; the relay to Meta finishes after the response is sent.
  after(() =>
    sendCapiEvent({ eventName, eventId, sourceUrl, context, customData }).then(() => undefined),
  );

  return NextResponse.json({ ok: true });
}
