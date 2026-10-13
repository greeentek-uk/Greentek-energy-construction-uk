import type { MetaEventName } from "@/lib/metaEvents";

export interface GoogleAdsSettings {
  conversionId: string;
  leadLabel: string;
  callLabel: string;
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

export function e164(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = `44${digits.slice(1)}`;
  return digits ? `+${digits}` : "";
}
