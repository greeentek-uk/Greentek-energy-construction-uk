"use client";

import { useRef, useState } from "react";
import { getCloudinaryUploadSignatureAction } from "../_actions/upload";
import { suggestAlt } from "@/lib/altText";

interface ImageUploadFieldProps {
  name: string;
  label: string;
  defaultValue?: string;
  required?: boolean;
  /** Called with the new URL after a successful upload — for parents (e.g. RepeatingFieldList) that need to track the value themselves instead of relying on this field's own hidden input. */
  onChange?: (url: string) => void;
  /** Form field name for this image's alt text. Omit to hide the alt input entirely. */
  altName?: string;
  altDefaultValue?: string;
  /** What the site falls back to when alt is left blank, shown as the placeholder. */
  altFallback?: string;
}

export default function ImageUploadField({
  name,
  label,
  defaultValue = "",
  required,
  onChange,
  altName,
  altDefaultValue = "",
  altFallback,
}: ImageUploadFieldProps) {
  const [url, setUrl] = useState(defaultValue);
  const [alt, setAlt] = useState(altDefaultValue);
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
      onChange?.(data.secure_url);
      // Only fill a blank field — never overwrite alt text someone wrote.
      setAlt((current) => current || suggestAlt(data.secure_url, altFallback));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-white/70 mb-1">
        {label}
        {required ? " *" : ""}
      </label>
      <input type="hidden" name={name} value={url} />
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          className="w-full h-32 object-cover rounded-lg border border-white/10 bg-white/5 mb-2"
        />
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all file:mr-3 file:rounded-md file:border-0 file:bg-[#c5eb02] file:text-black file:px-3 file:py-1.5 file:text-xs file:font-semibold"
      />
      {uploading && <p className="text-xs text-white/50 mt-1">Uploading…</p>}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}

      {altName && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-white/70">Alt text</label>
            {(url || altFallback) && (
              <button
                type="button"
                onClick={() => setAlt(suggestAlt(url, altFallback))}
                className="text-xs font-semibold text-[#c5eb02] hover:underline"
              >
                Auto-fill
              </button>
            )}
          </div>
          <input
            name={altName}
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder={
              altFallback
                ? `Leave blank to use "${altFallback}"`
                : "Describe the image for screen readers and search engines"
            }
            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
          />
          <p className="text-xs text-white/40 mt-1">
            Describe what the picture shows, not what it is — &ldquo;engineer fitting a
            solar panel to a tiled roof&rdquo;, not &ldquo;photo&rdquo;.
          </p>
        </div>
      )}
    </div>
  );
}
