"use client";

import { useRef, useState } from "react";
import { getCloudinaryUploadSignatureAction } from "../_actions/upload";

interface MultiImageUploadFieldProps {
  name: string;
  label: string;
  defaultValue?: string[];
  /** Form field name for the parallel alt-text array. Omit to hide the alt inputs. */
  altName?: string;
  altDefaultValue?: string[];
}

export default function MultiImageUploadField({
  name,
  label,
  defaultValue = [],
  altName,
  altDefaultValue = [],
}: MultiImageUploadFieldProps) {
  const [urls, setUrls] = useState<string[]>(defaultValue);
  // Kept positionally aligned with `urls` so the two hidden arrays stay paired
  // on submit — an image added or removed has to take its alt text with it.
  const [alts, setAlts] = useState<string[]>(() =>
    defaultValue.map((_, i) => altDefaultValue[i] ?? ""),
  );
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
      setAlts((prev) => [...prev, ...uploaded.map(() => "")]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(index: number) {
    setUrls((prev) => prev.filter((_, i) => i !== index));
    setAlts((prev) => prev.filter((_, i) => i !== index));
  }

  function updateAlt(index: number, value: string) {
    setAlts((prev) => prev.map((alt, i) => (i === index ? value : alt)));
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-white/70 mb-1">{label}</label>
      {urls.map((url, i) => (
        <input key={`url-${i}-${url}`} type="hidden" name={name} value={url} />
      ))}
      {altName &&
        urls.map((url, i) => (
          <input key={`alt-${i}-${url}`} type="hidden" name={altName} value={alts[i] ?? ""} />
        ))}
      {urls.length > 0 && (
        <div className="space-y-2 mb-2">
          {urls.map((url, i) => (
            <div
              key={`${i}-${url}`}
              className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-2"
            >
              <div className="relative shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  className="w-24 h-20 object-cover rounded-md border border-white/10"
                />
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  className="absolute top-1 right-1 bg-black/70 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
              {altName && (
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-semibold text-white/70 mb-1">
                    Alt text
                  </label>
                  <input
                    value={alts[i] ?? ""}
                    onChange={(e) => updateAlt(i, e.target.value)}
                    placeholder="Describe what this photo shows"
                    className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
                  />
                </div>
              )}
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
        className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all file:mr-3 file:rounded-md file:border-0 file:bg-[#c5eb02] file:text-black file:px-3 file:py-1.5 file:text-xs file:font-semibold"
      />
      {uploading && <p className="text-xs text-white/50 mt-1">Uploading…</p>}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}
