/**
 * WhatsApp chat link for a UK phone number as stored in Company Settings.
 *
 * wa.me wants the full international number as digits only — no "+", spaces
 * or leading zero — so "0333 533 4567" becomes 443335334567. Built from the
 * stored number so the footer can't drift from the phone shown elsewhere.
 */
export function whatsappUrl(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = `44${digits.slice(1)}`;
  return `https://wa.me/${digits}`;
}
