import { randomUUID } from "node:crypto";
import { getDb } from "./mongodb";
import { ENQUIRY_PHOTO_FOLDER } from "@/lib/quoteForm";

/**
 * Enquiry numbers, and the photo folder each numbered enquiry uploads into.
 *
 * Photos upload while the form is still being filled in, so the number is
 * given out with the first photo — before anyone knows whether the form will
 * be sent. The session records that, so photos from forms that were never
 * sent can be found and deleted, and a token ties later uploads (and the
 * final submission) to the same number without trusting the browser's say-so.
 */

const COUNTERS = "counters";
const SESSIONS = "enquirySessions";

/** Photo uploads one enquiry may sign — five photos plus a few retries. */
export const MAX_SIGNATURES_PER_ENQUIRY = 8;

/** Photo uploads the whole site may sign per day, however many visitors. */
export const MAX_SIGNATURES_PER_DAY = 300;

/** How long an unsent form's photos are kept before being deleted. */
export const UNSENT_PHOTO_TTL_MS = 24 * 60 * 60 * 1000;

interface CounterDoc {
  _id: string;
  seq: number;
}

interface EnquirySessionDoc {
  _id: number;
  token: string;
  createdAt: Date;
  signatures: number;
  submittedAt?: Date;
  /** Set once an unsent form's photos have been deleted from Cloudinary. */
  cleanedAt?: Date;
}

export interface EnquiryRef {
  number: number;
  token: string;
}

/** `enquiry-photos/00042` — zero-padded so folders sort in order in Cloudinary. */
export function enquiryPhotoFolder(number: number): string {
  return `${ENQUIRY_PHOTO_FOLDER}/${String(number).padStart(5, "0")}`;
}

async function nextNumber(): Promise<number> {
  const db = await getDb();
  const doc = await db
    .collection<CounterDoc>(COUNTERS)
    .findOneAndUpdate(
      { _id: "enquiry" },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: "after" },
    );
  return doc!.seq;
}

export async function createEnquiry(): Promise<EnquiryRef> {
  const db = await getDb();
  const number = await nextNumber();
  const token = randomUUID();
  await db.collection<EnquirySessionDoc>(SESSIONS).insertOne({
    _id: number,
    token,
    createdAt: new Date(),
    signatures: 0,
  });
  return { number, token };
}

function isRef(value: unknown): value is EnquiryRef {
  const v = value as EnquiryRef | null;
  return (
    !!v &&
    Number.isInteger(v.number) &&
    v.number > 0 &&
    typeof v.token === "string" &&
    /^[0-9a-f-]{36}$/.test(v.token)
  );
}

/**
 * Counts one more photo upload against the site's daily cap. Returns false
 * once the cap is reached.
 */
export async function takeDailySignature(): Promise<boolean> {
  const db = await getDb();
  const day = new Date().toISOString().slice(0, 10);
  const doc = await db
    .collection<CounterDoc>(COUNTERS)
    .findOneAndUpdate(
      { _id: `photo-signatures:${day}` },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: "after" },
    );
  return doc!.seq <= MAX_SIGNATURES_PER_DAY;
}

/**
 * Reserves one upload for an open (unsent) enquiry. Returns null if the
 * reference is invalid, already sent, or has used up its uploads.
 */
export async function takeEnquirySignature(ref: unknown): Promise<EnquiryRef | null> {
  if (!isRef(ref)) return null;
  const db = await getDb();
  const doc = await db.collection<EnquirySessionDoc>(SESSIONS).findOneAndUpdate(
    {
      _id: ref.number,
      token: ref.token,
      submittedAt: { $exists: false },
      cleanedAt: { $exists: false },
      signatures: { $lt: MAX_SIGNATURES_PER_ENQUIRY },
    },
    { $inc: { signatures: 1 } },
    { returnDocument: "after" },
  );
  return doc ? { number: doc._id, token: doc.token } : null;
}

/**
 * Marks an enquiry as sent, so its photos are kept. Returns its number, or
 * null if the reference doesn't match an open enquiry — the caller then gives
 * the enquiry a fresh number and ignores its photos.
 */
export async function submitEnquiry(ref: unknown): Promise<number | null> {
  if (!isRef(ref)) return null;
  const db = await getDb();
  const doc = await db.collection<EnquirySessionDoc>(SESSIONS).findOneAndUpdate(
    {
      _id: ref.number,
      token: ref.token,
      submittedAt: { $exists: false },
      cleanedAt: { $exists: false },
    },
    { $set: { submittedAt: new Date() } },
    { returnDocument: "after" },
  );
  return doc ? doc._id : null;
}

/** A number for an enquiry sent without photos. */
export async function createSubmittedEnquiry(): Promise<number> {
  const db = await getDb();
  const number = await nextNumber();
  await db.collection<EnquirySessionDoc>(SESSIONS).insertOne({
    _id: number,
    token: randomUUID(),
    createdAt: new Date(),
    signatures: 0,
    submittedAt: new Date(),
  });
  return number;
}

/**
 * Unsent enquiries past the TTL that uploaded photos. Claimed atomically one at
 * a time, so two server instances cleaning up at once never pick the same one.
 */
export async function claimStaleEnquiry(): Promise<number | null> {
  const db = await getDb();
  const doc = await db.collection<EnquirySessionDoc>(SESSIONS).findOneAndUpdate(
    {
      submittedAt: { $exists: false },
      cleanedAt: { $exists: false },
      signatures: { $gt: 0 },
      createdAt: { $lt: new Date(Date.now() - UNSENT_PHOTO_TTL_MS) },
    },
    { $set: { cleanedAt: new Date() } },
    { sort: { createdAt: 1 }, returnDocument: "after" },
  );
  return doc ? doc._id : null;
}
