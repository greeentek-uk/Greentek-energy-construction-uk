import nodemailer from "nodemailer";

export interface QuoteRequestPayload {
  full_name: string;
  email: string;
  phone: string;
  postcode: string;
  service: string;
  property_type: string;
  is_homeowner: string;
  timeline: string;
  message: string;
}

function humanize(value: string): string {
  if (!value) return "—";
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
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
    ["Name", data.full_name],
    ["Email", data.email],
    ["Phone", data.phone],
    ["Postcode", data.postcode],
    ["Service", humanize(data.service)],
    ["Property type", humanize(data.property_type)],
    ["Homeowner?", humanize(data.is_homeowner)],
    ["Timeline", humanize(data.timeline)],
  ];

  const text = [
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    "Message:",
    data.message || "(none)",
  ].join("\n");

  const html = `
    <table cellpadding="6" cellspacing="0" style="font-family: sans-serif; font-size: 14px;">
      ${rows.map(([label, value]) => `<tr><td><strong>${label}</strong></td><td>${value}</td></tr>`).join("")}
    </table>
    <p style="font-family: sans-serif; font-size: 14px;"><strong>Message:</strong><br/>${(data.message || "(none)").replace(/\n/g, "<br/>")}</p>
  `;

  await transporter.sendMail({
    from: `"Greentek Website" <${from}>`,
    to,
    replyTo: data.email,
    subject: `New quote request — ${data.full_name} (${humanize(data.service)})`,
    text,
    html,
  });
}
