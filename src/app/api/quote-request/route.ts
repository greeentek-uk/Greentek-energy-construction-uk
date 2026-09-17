import { NextResponse, after } from "next/server";
import { contextFromRequest, sendCapiEvent } from "@/lib/metaCapi";
import { metaAllowedForRequest } from "@/lib/metaConsent";
import { sendQuoteRequestEmail, type QuoteRequestPayload } from "@/lib/mailer";
import { MAX_ENQUIRY_PHOTOS } from "@/lib/quoteForm";
import { createSubmittedEnquiry, enquiryPhotoFolder, submitEnquiry } from "@/lib/db/enquiries";

/**
 * Photo links are only accepted if they point at this enquiry's own folder in
 * our Cloudinary account — otherwise the form could be used to put any link
 * into an email the team will trust and click, or to attach someone else's
 * photos.
 */
function validPhotos(value: unknown, folder: string): string[] {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName || !Array.isArray(value)) return [];
  const escaped = cloudName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `^https://res\\.cloudinary\\.com/${escaped}/image/upload/(?:v\\d+/)?${folder}/[A-Za-z0-9_-]+\\.jpg$`,
  );
  return [...new Set(value.filter((v): v is string => typeof v === "string" && pattern.test(v)))].slice(
    0,
    MAX_ENQUIRY_PHOTOS,
  );
}

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

  // Photos only count if they belong to an open enquiry this form started;
  // anything else gets a fresh number and its photo links are dropped.
  let enquiryNumber: number;
  let photos: string[] = [];
  try {
    const opened = await submitEnquiry(body.enquiry);
    if (opened !== null) {
      enquiryNumber = opened;
      photos = validPhotos(body.photos, enquiryPhotoFolder(opened));
    } else {
      enquiryNumber = await createSubmittedEnquiry();
    }
  } catch (err) {
    console.error("Failed to number enquiry:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  const payload: QuoteRequestPayload = {
    enquiry_number: enquiryNumber,
    full_name: String(body.full_name),
    email: String(body.email),
    phone: String(body.phone),
    postcode: String(body.postcode),
    service: String(body.service),
    property_type: String(body.property_type || ""),
    is_homeowner: String(body.is_homeowner || ""),
    timeline: String(body.timeline || ""),
    budget: String(body.budget || ""),
    message: String(body.message || ""),
    photos,
    source: String(body.source || "Contact form"),
  };

  try {
    await sendQuoteRequestEmail(payload);
  } catch (err) {
    console.error("Failed to send quote request email:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }

  // The server-side half of the Lead. It's sent only once the enquiry has
  // really been received, with the same event id the browser pixel uses on the
  // thank-you page, so Meta counts one lead rather than two.
  const eventId = typeof body.event_id === "string" && /^[A-Za-z0-9-]{8,64}$/.test(body.event_id)
    ? body.event_id
    : null;
  if (eventId && (await metaAllowedForRequest(request))) {
    const context = contextFromRequest(request);
    const sourceUrl = typeof body.page_url === "string" ? body.page_url.slice(0, 1000) : undefined;
    after(() =>
      sendCapiEvent({
        eventName: "Lead",
        eventId,
        sourceUrl,
        context,
        user: { email: payload.email, phone: payload.phone, fullName: payload.full_name },
        customData: { content_name: payload.service, content_category: payload.source ?? "" },
      }).then(() => undefined),
    );
  }

  return NextResponse.json({ ok: true });
}
