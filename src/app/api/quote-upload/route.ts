import { NextResponse, after } from "next/server";
import { deleteFolder, signUploadParams } from "@/lib/cloudinary";
import {
  claimStaleEnquiry,
  createEnquiry,
  enquiryPhotoFolder,
  takeDailySignature,
  takeEnquirySignature,
} from "@/lib/db/enquiries";
import { MAX_ENQUIRY_PHOTOS } from "@/lib/quoteForm";

/**
 * Signs one property-photo upload for the enquiry form.
 *
 * The photo goes straight from the visitor's phone to Cloudinary, so it never
 * passes through our server or hits Vercel's request-size limit. Everything
 * that matters is part of the signature, so the browser can't change it:
 *
 * - the folder — one numbered folder per enquiry (enquiry-photos/00042)
 * - JPEG, PNG and HEIC only
 * - what Cloudinary keeps: the photo is resized to at most 2000px and saved as
 *   a compressed JPG as it arrives, and the original is discarded. However
 *   large the upload, the stored copy is a few hundred KB, and a JPG link
 *   opens on any device (a HEIC one doesn't).
 *
 * Signatures are capped per enquiry, per visitor and per day, so the account
 * can't be filled by repeatedly calling this endpoint.
 */
const ALLOWED_FORMATS = "jpg,jpeg,png,heic,heif";
// f_jpg converts inside the stored transformation. Cloudinary's separate
// `format` upload parameter was tested and is no good here: it skips the
// allowed_formats check (a GIF got through) and didn't convert a PNG anyway.
const INCOMING_TRANSFORMATION = "c_limit,w_2000,h_2000,q_auto:good,f_jpg";

// Per server instance, so best effort — the per-enquiry and daily caps in the
// database are the hard limits.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = MAX_ENQUIRY_PHOTOS * 4;
const recent = new Map<string, number[]>();

function allow(ip: string): boolean {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= MAX_PER_WINDOW) {
    recent.set(ip, hits);
    return false;
  }
  hits.push(now);
  recent.set(ip, hits);
  if (recent.size > 5000) recent.clear();
  return true;
}

// Unsent forms' photos are deleted from here rather than a scheduled job:
// this runs whenever someone uploads, which is exactly when new orphans can
// appear. At most every half hour per instance, a few folders at a time.
const CLEANUP_INTERVAL_MS = 30 * 60 * 1000;
let lastCleanup = 0;

async function cleanUpUnsentPhotos(): Promise<void> {
  for (let i = 0; i < 10; i++) {
    const number = await claimStaleEnquiry();
    if (number === null) return;
    await deleteFolder(enquiryPhotoFolder(number)).catch((err) =>
      console.error(`Failed to delete photos for unsent enquiry ${number}:`, err),
    );
  }
}

export async function POST(request: Request): Promise<Response> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  if (!cloudName || !apiKey || !process.env.CLOUDINARY_API_SECRET) {
    return NextResponse.json({ error: "Photo uploads aren't available right now." }, { status: 503 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  if (!allow(ip)) {
    return NextResponse.json({ error: "Too many uploads — please try again later." }, { status: 429 });
  }

  const body = (await request.json().catch(() => ({}))) as { enquiry?: unknown };

  try {
    if (!(await takeDailySignature())) {
      return NextResponse.json(
        { error: "Photo uploads are paused for today — please describe the job instead." },
        { status: 429 },
      );
    }

    let enquiry = body.enquiry ? await takeEnquirySignature(body.enquiry) : null;
    if (body.enquiry && !enquiry) {
      return NextResponse.json(
        { error: `You can add up to ${MAX_ENQUIRY_PHOTOS} photos.` },
        { status: 429 },
      );
    }
    if (!enquiry) {
      const created = await createEnquiry();
      enquiry = await takeEnquirySignature(created);
    }
    if (!enquiry) throw new Error("Could not open an enquiry");

    if (Date.now() - lastCleanup > CLEANUP_INTERVAL_MS) {
      lastCleanup = Date.now();
      after(() => cleanUpUnsentPhotos().catch((err) => console.error("Photo cleanup failed:", err)));
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const params = {
      timestamp,
      folder: enquiryPhotoFolder(enquiry.number),
      allowed_formats: ALLOWED_FORMATS,
      transformation: INCOMING_TRANSFORMATION,
      tags: "enquiry",
    };

    return NextResponse.json({
      params,
      signature: signUploadParams(params),
      apiKey,
      cloudName,
      enquiry,
    });
  } catch (err) {
    console.error("Failed to sign photo upload:", err);
    return NextResponse.json({ error: "Upload failed — please try again." }, { status: 500 });
  }
}
