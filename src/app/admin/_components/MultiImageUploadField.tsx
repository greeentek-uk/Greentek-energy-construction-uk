"use client";

import { useRef, useState } from "react";
import { getCloudinaryUploadSignatureAction } from "../_actions/upload";

interface MultiImageUploadFieldProps {
  name: string;
  label: string;
  defaultValue?: string[];
}

export default function MultiImageUploadField({
  name,
  label,
  defaultValue = [],
}: MultiImageUploadFieldProps) {
  const [urls, setUrls] = useState<string[]>(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadOne(file: File): Promise<string> {
    const sig = await getCloudinaryUploadSignatureAction();
    const body = new FormData();
    body.append("file", file);
    body.append("api_key", sig.apiKey);
    body.append("timestamp", String(sig.timestamp));
    body.append("signature", sig.signature);
    body.append("folder", sig.folder);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
      { method: "POST", body },
    );
    if (!res.ok) throw new Error("Upload failed");
    const data = (await res.json()) as { secure_url: string };
    return data.secure_url;
  }

  async function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    setError(null);
    try {
      const uploaded = await Promise.all(files.map(uploadOne));
      setUrls((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(index: number) {
    setUrls((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-zinc-600 mb-1">{label}</label>
      {urls.map((url, i) => (
        <input key={`${i}-${url}`} type="hidden" name={name} value={url} />
      ))}
      {urls.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mb-2">
          {urls.map((url, i) => (
            <div key={`${i}-${url}`} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="w-full h-20 object-cover rounded-lg border border-zinc-200 bg-zinc-100"
              />
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute top-1 right-1 bg-black/70 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFilesChange}
        disabled={uploading}
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-900 file:text-white file:px-3 file:py-1.5 file:text-xs file:font-semibold"
      />
      {uploading && <p className="text-xs text-zinc-500 mt-1">Uploading…</p>}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
