"use client";

import { useState } from "react";
import type { LlmsConfig } from "@/lib/llmsConfig";
import { saveLlmsAction } from "../_actions/siteFiles";

const inputClass =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all";

const SECTIONS: { key: keyof LlmsConfig; label: string; help: string }[] = [
  { key: "includeCorePages", label: "Core pages", help: "Home, About, Services, Projects, Locations, Blog, Contact." },
  { key: "includeServices", label: "Services", help: "Every service page, with its description." },
  { key: "includeLocations", label: "Service areas", help: "Every location page, with its tagline." },
  { key: "includeBlog", label: "Blog articles", help: "Most recent posts, with excerpts." },
  { key: "includeOptional", label: "Optional section", help: "Privacy and terms, marked as lower priority." },
];

export default function LlmsEditor({
  initial,
  generatedPreview,
}: {
  initial: LlmsConfig;
  /** Rendered server-side from the saved config — regenerating needs a DB read. */
  generatedPreview: string;
}) {
  const [config, setConfig] = useState<LlmsConfig>(initial);

  function patch(changes: Partial<LlmsConfig>) {
    setConfig((prev) => ({ ...prev, ...changes }));
  }

  const dirty = JSON.stringify(config) !== JSON.stringify(initial);

  return (
    <form action={saveLlmsAction} className="space-y-5">
      <input type="hidden" name="config" value={JSON.stringify(config)} />

      <label className="flex items-start gap-2 text-sm text-white/70">
        <input
          type="checkbox"
          checked={config.enabled}
          onChange={(e) => patch({ enabled: e.target.checked })}
          className="accent-[#c5eb02] mt-1"
        />
        <span>
          Serve /llms.txt
          <span className="block text-xs text-white/40">
            Turn off and the URL returns 404, as if the file were never added.
          </span>
        </span>
      </label>

      {config.enabled && (
        <>
          <div className="flex flex-wrap gap-2">
            {(["generated", "raw"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => patch({ mode })}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  config.mode === mode
                    ? "bg-[#c5eb02] text-black"
                    : "border border-white/15 text-white/70 hover:text-white hover:border-white/30"
                }`}
              >
                {mode === "generated" ? "Build from site content" : "Edit as text"}
              </button>
            ))}
          </div>

          {config.mode === "generated" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Summary line
                </label>
                <textarea
                  value={config.intro}
                  onChange={(e) => patch({ intro: e.target.value })}
                  rows={2}
                  placeholder="Leave blank to use your company description"
                  className={inputClass}
                />
                <p className="text-xs text-white/40 mt-1">
                  The one-line summary an assistant reads first, quoted under the title.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-white/70">Sections to include</p>
                {SECTIONS.map((section) => (
                  <label
                    key={section.key}
                    className="flex items-start gap-2 text-sm text-white/70"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(config[section.key])}
                      onChange={(e) => patch({ [section.key]: e.target.checked })}
                      className="accent-[#c5eb02] mt-1"
                    />
                    <span>
                      {section.label}
                      <span className="block text-xs text-white/40">{section.help}</span>
                    </span>
                  </label>
                ))}
              </div>

              {config.includeBlog && (
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">
                    Maximum blog articles
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={200}
                    value={config.blogLimit}
                    onChange={(e) => patch({ blogLimit: Number(e.target.value) })}
                    className={inputClass}
                  />
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">
                llms.txt contents
              </label>
              <textarea
                value={config.raw || generatedPreview}
                onChange={(e) => patch({ raw: e.target.value })}
                rows={22}
                spellCheck={false}
                className={`${inputClass} font-mono text-xs leading-relaxed`}
              />
              <p className="text-xs text-white/40 mt-1">
                Served exactly as written — it stops updating itself when services or posts
                change, so you own keeping it current.
              </p>
            </div>
          )}
        </>
      )}

      <div>
        <p className="text-xs font-semibold text-white/70 mb-1">
          Preview{dirty ? " — from the last save; save to refresh" : ""}
        </p>
        <pre className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white/60 font-mono overflow-x-auto whitespace-pre-wrap max-h-96">
          {config.mode === "raw" ? config.raw || generatedPreview : generatedPreview}
        </pre>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          className="rounded-lg bg-[#c5eb02] text-black text-sm font-semibold px-6 py-3 hover:bg-[#c5eb02]/80"
        >
          Save llms.txt
        </button>
        <a
          href="/llms.txt"
          target="_blank"
          rel="noreferrer"
          className="text-sm text-white/50 hover:text-white"
        >
          View live file ↗
        </a>
      </div>
    </form>
  );
}
