import type { MetaEventName } from "@/lib/metaEvents";

/**
 * Google Ads conversion tracking. The id is the account's tag (AW-…); each
 * label is one conversion action created in Google Ads (Goals → Conversions),
 * whose "Event snippet" shows it as send_to: 'AW-…/<label>'. A blank label
 * just means that action isn't reported.
 *
 * Kept free of server imports: the browser reads these settings too.
 */
export interface GoogleAdsSettings {
  conversionId: string;
  /** Fired on the thank-you page once an enquiry has really been received. */
  leadLabel: string;
  /** A tap on any phone number. */
  callLabel: string;
  /** A tap on any WhatsApp link. */
  whatsappLabel: string;
}

export const EMPTY_GOOGLE_ADS: GoogleAdsSettings = {
  conversionId: "",
  leadLabel: "",
  callLabel: "",
  whatsappLabel: "",
};

export const ADS_ID_PATTERN = /^AW-\d{6,15}$/;
export const ADS_LABEL_PATTERN = /^[A-Za-z0-9_-]{4,64}$/;

/**
 * The `send_to` for one of our events, or null when it isn't a Google Ads
 * conversion (or that action has no label).
 *
 * Only real intent counts: an enquiry received, a call, a WhatsApp. StartQuote
 * and page views are deliberately not conversions — bidding on them teaches
 * Google to buy clicks from people who open a form and leave.
 */
export function adsSendTo(
  settings: GoogleAdsSettings,
  name: MetaEventName,
  params: Record<string, unknown>,
): string | null {
  if (!ADS_ID_PATTERN.test(settings.conversionId)) return null;
  let label = "";
  if (name === "Lead") label = settings.leadLabel;
  else if (name === "Contact" && params.content_name === "phone") label = settings.callLabel;
  else if (name === "Contact" && params.content_name === "whatsapp") label = settings.whatsappLabel;
  return label ? `${settings.conversionId}/${label}` : null;
}

/**
 * UK phone in E.164 for enhanced conversions ("+447700900123"). Google hashes
 * it in the browser; it only matches if the format is exact.
 */
export function e164(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = `44${digits.slice(1)}`;
  return digits ? `+${digits}` : "";
}
