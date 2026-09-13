"use client";

import { useState } from "react";
import { OG_TYPES, TWITTER_CARDS, CHANGE_FREQUENCIES, type SeoOverride } from "@/lib/seoTypes";
import { saveSeoOverrideAction } from "../_actions/seo";

const inputClass =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all";

const TABS = ["General", "Social", "Advanced"] as const;
type Tab = (typeof TABS)[number];

function Counter({ value, ideal, max }: { value: string; ideal: number; max: number }) {
  const length = value.length;
  const tone =
    length === 0
      ? "text-white/30"
      : length > max
        ? "text-red-400"
        : length >= ideal
          ? "text-green-400"
          : "text-amber-300";
  return (
    <span className={`text-xs ${tone}`}>
      {length}/{max}
    </span>
  );
}

export default function SeoOverrideForm({
  path,
  override,
  preview,
}: {
  path: string;
  override: SeoOverride | undefined;
  /** What the page would show with no override — the placeholder text. */
  preview: { title: string; description: string; url: string };
}) {
  const [tab, setTab] = useState<Tab>("General");
  const [title, setTitle] = useState(override?.title ?? "");
  const [description, setDescription] = useState(override?.description ?? "");
  const [noindex, setNoindex] = useState(Boolean(override?.noindex));

  const shownTitle = title || preview.title;
  const shownDescription = description || preview.description;

  return (
    <form action={saveSeoOverrideAction} className="space-y-5">
      <input type="hidden" name="path" value={path} />

      {/* Search result preview — the whole point of editing these fields */}
      <div className="rounded-xl border border-white/10 bg-white p-4">
        <p className="text-xs text-[#202124] truncate">{preview.url}</p>
        <p className="text-[#1a0dab] text-lg leading-snug truncate">{shownTitle}</p>
        <p className="text-[#4d5156] text-sm line-clamp-2">{shownDescription}</p>
        {noindex && (
          <p className="mt-2 text-xs font-semibold text-red-600">
            Marked noindex — this page will not appear in search results at all.
          </p>
        )}
      </div>

      <div className="flex gap-2 border-b border-white/10">
        {TABS.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setTab(name)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              tab === name
                ? "border-[#c5eb02] text-white"
                : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <div className={tab === "General" ? "space-y-4" : "hidden"}>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-white/70">Meta title</label>
            <Counter value={shownTitle} ideal={30} max={60} />
          </div>
          <input
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={preview.title}
            className={inputClass}
          />
          <p className="text-xs text-white/40 mt-1">
            Blank uses the site-wide template for this page type.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-white/70">Meta description</label>
            <Counter value={shownDescription} ideal={120} max={160} />
          </div>
          <textarea
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder={preview.description}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-white/70 mb-1">
            Canonical URL
          </label>
          <input
            name="canonical"
            defaultValue={override?.canonical ?? ""}
            placeholder={path}
            className={inputClass}
          />
          <p className="text-xs text-white/40 mt-1">
            Only set this when the same content lives at more than one URL, to name the
            one Google should rank.
          </p>
        </div>
      </div>

      <div className={tab === "Social" ? "space-y-4" : "hidden"}>
        <p className="text-xs text-white/40">
          Controls how the page looks when shared on Facebook, LinkedIn or X. Anything left
          blank falls back to the meta title, description and image above.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1">
              Open Graph title
            </label>
            <input name="ogTitle" defaultValue={override?.ogTitle ?? ""} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1">
              Open Graph type
            </label>
            <select name="ogType" defaultValue={override?.ogType ?? ""} className={inputClass}>
              <option value="">Default</option>
              {OG_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-white/70 mb-1">
            Open Graph description
          </label>
          <textarea
            name="ogDescription"
            defaultValue={override?.ogDescription ?? ""}
            rows={2}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-white/70 mb-1">
            Share image URL
          </label>
          <input
            name="ogImage"
            defaultValue={override?.ogImage ?? ""}
            placeholder="https://… — 1200×630 works best"
            className={inputClass}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 border-t border-white/10 pt-4">
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1">
              X / Twitter card
            </label>
            <select
              name="twitterCard"
              defaultValue={override?.twitterCard ?? ""}
              className={inputClass}
            >
              <option value="">Site default</option>
              {TWITTER_CARDS.map((card) => (
                <option key={card} value={card}>
                  {card}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1">
              X / Twitter image URL
            </label>
            <input
              name="twitterImage"
              defaultValue={override?.twitterImage ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1">
              X / Twitter title
            </label>
            <input
              name="twitterTitle"
              defaultValue={override?.twitterTitle ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1">
              X / Twitter description
            </label>
            <input
              name="twitterDescription"
              defaultValue={override?.twitterDescription ?? ""}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className={tab === "Advanced" ? "space-y-4" : "hidden"}>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-white/70">Crawler directives</p>
          <label className="flex items-start gap-2 text-sm text-white/70">
            <input
              type="checkbox"
              name="noindex"
              checked={noindex}
              onChange={(e) => setNoindex(e.target.checked)}
              className="accent-[#c5eb02] mt-1"
            />
            <span>
              No index
              <span className="block text-xs text-white/40">
                Keeps the page out of search results. It&apos;s also dropped from the
                sitemap automatically.
              </span>
            </span>
          </label>
          {[
            ["nofollow", "No follow", "Tells crawlers not to follow links on this page."],
            ["noarchive", "No archive", "Stops search engines showing a cached copy."],
            ["nosnippet", "No snippet", "Stops a text preview appearing in results."],
            ["noimageindex", "No image index", "Keeps this page's images out of image search."],
          ].map(([name, label, help]) => (
            <label key={name} className="flex items-start gap-2 text-sm text-white/70">
              <input
                type="checkbox"
                name={name}
                defaultChecked={Boolean(override?.[name as keyof SeoOverride])}
                className="accent-[#c5eb02] mt-1"
              />
              <span>
                {label}
                <span className="block text-xs text-white/40">{help}</span>
              </span>
            </label>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1">
              Max snippet length
            </label>
            <input
              name="maxSnippet"
              defaultValue={override?.maxSnippet ?? ""}
              placeholder="-1 for no limit"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1">
              Max image preview
            </label>
            <select
              name="maxImagePreview"
              defaultValue={override?.maxImagePreview ?? ""}
              className={inputClass}
            >
              <option value="">Default</option>
              <option value="none">none</option>
              <option value="standard">standard</option>
              <option value="large">large</option>
            </select>
          </div>
        </div>

        <div className="space-y-3 border-t border-white/10 pt-4">
          <p className="text-xs font-semibold text-white/70">Sitemap</p>
          <label className="flex items-start gap-2 text-sm text-white/70">
            <input
              type="checkbox"
              name="excludeFromSitemap"
              defaultChecked={Boolean(override?.excludeFromSitemap)}
              className="accent-[#c5eb02] mt-1"
            />
            <span>Leave this page out of the XML sitemap</span>
          </label>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">
                Priority
              </label>
              <input
                name="sitemapPriority"
                type="number"
                min={0}
                max={1}
                step={0.1}
                defaultValue={override?.sitemapPriority ?? ""}
                placeholder="Section default"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">
                Change frequency
              </label>
              <select
                name="sitemapChangeFreq"
                defaultValue={override?.sitemapChangeFreq ?? ""}
                className={inputClass}
              >
                <option value="">Section default</option>
                {CHANGE_FREQUENCIES.map((freq) => (
                  <option key={freq} value={freq}>
                    {freq}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="rounded-lg bg-[#c5eb02] text-black text-sm font-semibold px-6 py-3 hover:bg-[#c5eb02]/80"
      >
        Save SEO
      </button>
    </form>
  );
}
