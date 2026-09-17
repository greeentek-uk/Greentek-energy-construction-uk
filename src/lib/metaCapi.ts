import crypto from "crypto";
import { getMetaPixelSettingsCached } from "@/lib/db/metaPixel";
import type { MetaEventName } from "@/lib/metaEvents";

/** Checked against the live Graph API: v25.0 resolves the events edge. */
const GRAPH_VERSION = "v25.0";

export interface CapiUserInput {
  email?: string;
  phone?: string;
  fullName?: string;
}

export interface CapiRequestContext {
  ip: string | null;
  userAgent: string | null;
  /** `_fbp` cookie — Meta's browser id, set by the pixel. */
  fbp: string | null;
  /** `_fbc` cookie, if the visitor arrived from a Meta ad. */
  fbc: string | null;
}

/** Pulls what Meta needs to match a server event to a person out of the incoming request. */
export function contextFromRequest(request: Request): CapiRequestContext {
  const cookies = Object.fromEntries(
    (request.headers.get("cookie") ?? "")
      .split(";")
      .map((part) => part.trim().split("="))
      .filter(([key]) => key)
      .map(([key, ...rest]) => [key, decodeURIComponent(rest.join("="))]),
  );
  const forwarded = request.headers.get("x-forwarded-for");
  return {
    ip: forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip"),
    userAgent: request.headers.get("user-agent"),
    fbp: cookies._fbp ?? null,
    fbc: cookies._fbc ?? null,
  };
}

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

/**
 * UK phone to Meta's required format before hashing: digits only, with the
 * country code and no leading zero. "0333 533 4567" and "+44 333 533 4567" must
 * hash identically, or the same person looks like two.
 */
export function normalizePhone(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = `44${digits.slice(1)}`;
  return digits;
}

/** `fbc` from the ad-click id in the URL, when the `_fbc` cookie hasn't been set yet. */
export function fbcFromUrl(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const fbclid = new URL(url).searchParams.get("fbclid");
    return fbclid ? `fb.1.${Date.now()}.${fbclid}` : null;
  } catch {
    return null;
  }
}

export function buildUserData(context: CapiRequestContext, sourceUrl: string | undefined, input?: CapiUserInput) {
  const userData: Record<string, unknown> = {};
  if (context.ip) userData.client_ip_address = context.ip;
  if (context.userAgent) userData.client_user_agent = context.userAgent;
  if (context.fbp) userData.fbp = context.fbp;
  const fbc = context.fbc ?? fbcFromUrl(sourceUrl);
  if (fbc) userData.fbc = fbc;

  // Personal data is only ever sent hashed, and only for events where the
  // visitor has just given it to us (an enquiry) — never from the browser.
  if (input?.email?.trim()) userData.em = [sha256(input.email.trim().toLowerCase())];
  if (input?.phone?.trim()) userData.ph = [sha256(normalizePhone(input.phone))];
  if (input?.fullName?.trim()) {
    const parts = input.fullName.trim().toLowerCase().split(/\s+/);
    userData.fn = [sha256(parts[0])];
    if (parts.length > 1) userData.ln = [sha256(parts[parts.length - 1])];
  }
  if (input?.email || input?.phone) userData.country = [sha256("gb")];

  return userData;
}

/**
 * Sends one event to the Meta Conversions API.
 *
 * Never throws: tracking must not be able to break an enquiry. Does nothing
 * until both a pixel id (panel) and an access token (environment) are set.
 */
export async function sendCapiEvent(options: {
  eventName: MetaEventName;
  eventId: string;
  sourceUrl?: string;
  context: CapiRequestContext;
  user?: CapiUserInput;
  customData?: Record<string, unknown>;
}): Promise<{ sent: boolean; reason?: string }> {
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  const { pixelId, testEventCode } = await getMetaPixelSettingsCached();
  if (!token) return { sent: false, reason: "META_CAPI_ACCESS_TOKEN not set" };
  if (!pixelId) return { sent: false, reason: "No pixel id in the panel" };

  const event = {
    event_name: options.eventName,
    event_time: Math.floor(Date.now() / 1000),
    // Must equal the browser pixel's eventID so Meta counts the pair once.
    event_id: options.eventId,
    action_source: "website",
    ...(options.sourceUrl ? { event_source_url: options.sourceUrl } : {}),
    user_data: buildUserData(options.context, options.sourceUrl, options.user),
    ...(options.customData && Object.keys(options.customData).length
      ? { custom_data: options.customData }
      : {}),
  };

  try {
    const response = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [event],
        access_token: token,
        ...(testEventCode ? { test_event_code: testEventCode } : {}),
      }),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error(`Meta CAPI ${options.eventName} rejected: ${response.status} ${detail.slice(0, 300)}`);
      return { sent: false, reason: `HTTP ${response.status}` };
    }
    return { sent: true };
  } catch (err) {
    console.error("Meta CAPI request failed:", err);
    return { sent: false, reason: "network error" };
  }
}
