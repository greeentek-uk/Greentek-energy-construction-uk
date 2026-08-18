import { NextResponse } from "next/server";
import { sendQuoteRequestEmail, type QuoteRequestPayload } from "@/lib/mailer";

const REQUIRED_FIELDS = ["full_name", "email", "phone", "postcode", "service"] as const;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  for (const field of REQUIRED_FIELDS) {
    if (typeof body[field] !== "string" || !body[field].trim()) {
      return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
    }
  }

  if (!body.consent) {
    return NextResponse.json({ error: "Consent is required" }, { status: 400 });
  }

  const payload: QuoteRequestPayload = {
    full_name: String(body.full_name),
    email: String(body.email),
    phone: String(body.phone),
    postcode: String(body.postcode),
    service: String(body.service),
    property_type: String(body.property_type || ""),
    is_homeowner: String(body.is_homeowner || ""),
    timeline: String(body.timeline || ""),
    message: String(body.message || ""),
  };

  try {
    await sendQuoteRequestEmail(payload);
  } catch (err) {
    console.error("Failed to send quote request email:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
