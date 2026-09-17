"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, Loader2, RotateCcw, X } from "lucide-react";
import {
  isAllowedPhoto,
  MAX_ENQUIRY_PHOTOS,
  MAX_PHOTO_BYTES,
  PHOTO_EXTENSIONS,
  PHOTO_MIME_TYPES,
} from "@/lib/quoteForm";

export interface EnquiryRef {
  number: number;
  token: string;
}

const ACCEPT = [...PHOTO_MIME_TYPES, ...PHOTO_EXTENSIONS].join(",");

export interface PhotoItem {
  id: string;
  preview: string;
  status: "uploading" | "done" | "error";
  url?: string;
  file: File;
}

interface UploadSignature {
  params: Record<string, string | number>;
  signature: string;
  apiKey: string;
  cloudName: string;
  enquiry: EnquiryRef;
  error?: string;
}

const MAX_EDGE = 2000;

/**
 * Shrinks a phone photo before upload: a 12MP image is 3–8MB, which is slow on
 * mobile data, and the team only needs enough detail to judge the job.
 * Redrawing it also drops the photo's metadata, including where it was taken.
 * Anything the browser can't decode (some HEIC files) is sent as it is.
 */
async function shrink(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.82),
    );
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

async function requestSignature(enquiry: EnquiryRef | null): Promise<UploadSignature> {
  const res = await fetch("/api/quote-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(enquiry ? { enquiry } : {}),
  });
  const sig = (await res.json().catch(() => ({}))) as UploadSignature;
  if (!res.ok) throw new Error(sig.error || "Upload failed");
  return sig;
}

async function uploadWith(sig: UploadSignature, file: File): Promise<string> {
  const body = new FormData();
  body.append("file", await shrink(file));
  body.append("api_key", sig.apiKey);
  body.append("signature", sig.signature);
  for (const [key, value] of Object.entries(sig.params)) body.append(key, String(value));

  const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
    method: "POST",
    body,
  });
  if (!res.ok) throw new Error("Upload failed");
  return ((await res.json()) as { secure_url: string }).secure_url;
}

/**
 * "Take photo" opens the camera straight away on a phone; "Upload" opens the
 * gallery and allows several at once. Photos upload as soon as they're picked,
 * so they're ready by the time the form is sent.
 */
export default function PropertyPhotoPicker({
  photos,
  onChange,
  onEnquiry,
}: {
  photos: PhotoItem[];
  onChange: (update: (current: PhotoItem[]) => PhotoItem[]) => void;
  /** Receives the enquiry number the photos were filed under. */
  onEnquiry: (enquiry: EnquiryRef) => void;
}) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Every photo in one form belongs to one enquiry folder. The first upload
  // opens the enquiry; photos picked together wait for it rather than each
  // opening their own.
  const enquiryRef = useRef<Promise<EnquiryRef> | null>(null);

  async function upload(file: File): Promise<string> {
    if (!enquiryRef.current) {
      const first = requestSignature(null);
      enquiryRef.current = first.then((sig) => {
        onEnquiry(sig.enquiry);
        return sig.enquiry;
      });
      // A failed first request mustn't leave every later photo waiting on it.
      enquiryRef.current.catch(() => {
        enquiryRef.current = null;
      });
      return uploadWith(await first, file);
    }
    const enquiry = await enquiryRef.current;
    return uploadWith(await requestSignature(enquiry), file);
  }
  const remaining = MAX_ENQUIRY_PHOTOS - photos.length;

  // Previews are object URLs, which hold the image in memory until released.
  const previews = useRef(new Set<string>());
  useEffect(() => {
    const held = previews.current;
    return () => held.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  function start(item: PhotoItem) {
    upload(item.file).then(
      (url) =>
        onChange((current) =>
          current.map((p) => (p.id === item.id ? { ...p, status: "done", url } : p)),
        ),
      () =>
        onChange((current) =>
          current.map((p) => (p.id === item.id ? { ...p, status: "error" } : p)),
        ),
    );
  }

  function add(fileList: FileList | null) {
    const picked = Array.from(fileList ?? []);
    // Checked here, before a single byte is uploaded.
    const wrongType = picked.filter((f) => !isAllowedPhoto(f));
    const tooBig = picked.filter((f) => isAllowedPhoto(f) && f.size > MAX_PHOTO_BYTES);
    const files = picked.filter((f) => isAllowedPhoto(f) && f.size <= MAX_PHOTO_BYTES);

    const problems = [
      wrongType.length ? "Only JPEG, PNG or HEIC photos can be added." : "",
      tooBig.length ? "Each photo must be under 10MB." : "",
      files.length > remaining ? `You can add up to ${MAX_ENQUIRY_PHOTOS} photos.` : "",
    ].filter(Boolean);
    setNotice(problems.length ? problems.join(" ") : null);

    const items = files.slice(0, Math.max(remaining, 0)).map((file) => {
      const preview = URL.createObjectURL(file);
      previews.current.add(preview);
      return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        preview,
        status: "uploading" as const,
        file,
      };
    });
    if (!items.length) return;
    onChange((current) => [...current, ...items]);
    items.forEach(start);
  }

  function retry(item: PhotoItem) {
    onChange((current) =>
      current.map((p) => (p.id === item.id ? { ...p, status: "uploading" } : p)),
    );
    start(item);
  }

  function remove(id: string) {
    setNotice(null);
    onChange((current) => current.filter((p) => p.id !== id));
  }

  const pickerButton =
    "flex flex-1 items-center justify-center gap-2 min-h-12 rounded-xl border border-white/20 bg-white/10 px-3 text-sm font-bold text-white transition hover:bg-white/20 active:scale-[.98] disabled:opacity-40";

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between ml-1">
        <span className="text-xs font-bold text-white">Property photos</span>
        <span className="text-[11px] text-white/50">
          JPEG, PNG or HEIC · under 10MB · {photos.length}/{MAX_ENQUIRY_PHOTOS}
        </span>
      </div>

      <input
        ref={cameraRef}
        type="file"
        accept={ACCEPT}
        capture="environment"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          add(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={galleryRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          add(e.target.files);
          e.target.value = "";
        }}
      />

      <div className="flex gap-2">
        {/* A camera button only makes sense on a touch device; on a desktop
            the same input would just open a file browser. */}
        <button
          type="button"
          onClick={() => cameraRef.current?.click()}
          disabled={remaining <= 0}
          className={`${pickerButton} hidden pointer-coarse:flex`}
        >
          <Camera className="h-4 w-4" />
          Take photo
        </button>
        <button
          type="button"
          onClick={() => galleryRef.current?.click()}
          disabled={remaining <= 0}
          className={pickerButton}
        >
          <ImagePlus className="h-4 w-4" />
          Upload
        </button>
      </div>

      {photos.length > 0 && (
        <ul className="grid grid-cols-5 gap-2">
          {photos.map((photo) => (
            <li key={photo.id} className="relative aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.preview}
                alt=""
                className={`h-full w-full rounded-lg object-cover ${
                  photo.status === "done" ? "" : "opacity-50"
                }`}
              />
              {photo.status === "uploading" && (
                <span className="absolute inset-0 grid place-items-center">
                  <Loader2 className="h-5 w-5 animate-spin text-white" aria-label="Uploading" />
                </span>
              )}
              {photo.status === "error" && (
                <button
                  type="button"
                  onClick={() => retry(photo)}
                  className="absolute inset-0 grid place-items-center rounded-lg bg-red-900/60"
                  aria-label="Upload failed — tap to retry"
                >
                  <RotateCcw className="h-5 w-5 text-white" />
                </button>
              )}
              <button
                type="button"
                onClick={() => remove(photo.id)}
                aria-label="Remove photo"
                className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full bg-black text-white ring-1 ring-white/40"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {notice && (
        <p role="alert" className="text-[11px] text-amber-300 ml-1">
          {notice}
        </p>
      )}
    </div>
  );
}
