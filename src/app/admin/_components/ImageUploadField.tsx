"use client";

import { useRef, useState } from "react";
import { getCloudinaryUploadSignatureAction } from "../_actions/upload";

interface ImageUploadFieldProps {
  name: string;
  label: string;
  defaultValue?: string;
  required?: boolean;
}

export default function ImageUploadField({
  name,
  label,
  defaultValue = "",
  required,
}: ImageUploadFieldProps) {
  const [url, setUrl] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
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
      setUrl(data.secure_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-zinc-600 mb-1">
        {label}
        {required ? " *" : ""}
      </label>
      <input type="hidden" name={name} value={url} />
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          className="w-full h-32 object-cover rounded-lg border border-zinc-200 bg-zinc-100 mb-2"
        />
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-900 file:text-white file:px-3 file:py-1.5 file:text-xs file:font-semibold"
      />
      {uploading && <p className="text-xs text-zinc-500 mt-1">Uploading…</p>}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
