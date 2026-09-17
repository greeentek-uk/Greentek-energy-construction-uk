import nodemailer from "nodemailer";
import {
  budgetOptions,
  optionLabel,
  ownerOptions,
  serviceLabel,
  timelineOptions,
} from "@/lib/quoteForm";

export interface QuoteRequestPayload {
  /** Sequential enquiry number; also names the photo folder in Cloudinary. */
  enquiry_number?: number;
  full_name: string;
  email: string;
  phone: string;
  postcode: string;
  service: string;
  property_type: string;
  is_homeowner: string;
  timeline: string;
  budget?: string;
  message: string;
  /** Cloudinary links to property photos, already checked by the route. */
  photos?: string[];
  /** Which form the enquiry came from, so they can be told apart in the inbox. */
  source?: string;
}

function humanize(value: string): string {
  if (!value) return "—";
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Everything in the email comes from a public form, so none of it is trusted as HTML. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** A small thumbnail of a Cloudinary photo for the email body. */
function thumbnailUrl(url: string): string {
  return url.replace("/image/upload/", "/image/upload/c_fill,w_240,h_180,f_jpg,q_auto/");
}

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error("Gmail SMTP is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD.");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export async function sendQuoteRequestEmail(data: QuoteRequestPayload): Promise<void> {
  const transporter = getTransporter();
  const from = process.env.GMAIL_USER!;
  const to = process.env.CONTACT_TO_EMAIL || "info@greentekenergy.co.uk";

  const rows: [string, string][] = [
    ...(data.enquiry_number ? ([["Enquiry", `#${data.enquiry_number}`]] as [string, string][]) : []),
    ["Name", data.full_name],
    ["Email", data.email],
    ["Phone", data.phone],
    ["Postcode", data.postcode],
    ["Service", (serviceLabel(data.service) || humanize(data.service))],
    ["Property type", humanize(data.property_type)],
    ["Property owner?", optionLabel(ownerOptions, data.is_homeowner) || humanize(data.is_homeowner)],
    ["Timeline", optionLabel(timelineOptions, data.timeline) || humanize(data.timeline)],
    ["Budget", optionLabel(budgetOptions, data.budget ?? "") || humanize(data.budget ?? "")],
    ["Photos", data.photos?.length ? String(data.photos.length) : "None"],
    ["Came from", data.source || "Contact form"],
  ];

  const text = [
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    "Message:",
    data.message || "(none)",
    ...(data.photos?.length ? ["", "Property photos:", ...data.photos] : []),
  ].join("\n");

  const photosHtml = data.photos?.length
    ? `<p style="font-family: sans-serif; font-size: 14px;"><strong>Property photos</strong> (click to open full size)</p>
    <p>${data.photos
      .map(
        (url, i) =>
          `<a href="${escapeHtml(url)}" style="display:inline-block;margin:0 8px 8px 0;"><img src="${escapeHtml(thumbnailUrl(url))}" width="240" height="180" alt="Property photo ${i + 1}" style="border-radius:6px;display:block;" /></a>`,
      )
      .join("")}</p>
    <ol style="font-family: sans-serif; font-size: 13px;">${data.photos
      .map((url) => `<li><a href="${escapeHtml(url)}">${escapeHtml(url)}</a></li>`)
      .join("")}</ol>`
    : "";

  const html = `
    <table cellpadding="6" cellspacing="0" style="font-family: sans-serif; font-size: 14px;">
      ${rows.map(([label, value]) => `<tr><td><strong>${label}</strong></td><td>${escapeHtml(value)}</td></tr>`).join("")}
    </table>
    <p style="font-family: sans-serif; font-size: 14px;"><strong>Message:</strong><br/>${escapeHtml(data.message || "(none)").replace(/\n/g, "<br/>")}</p>
    ${photosHtml}
  `;

  await transporter.sendMail({
    from: `"Greentek Website" <${from}>`,
    to,
    replyTo: data.email,
    subject: `New quote request${data.enquiry_number ? ` #${data.enquiry_number}` : ""} — ${data.full_name} (${(serviceLabel(data.service) || humanize(data.service))})`,
    text,
    html,
  });
}
