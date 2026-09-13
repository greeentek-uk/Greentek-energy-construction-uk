"use client";

import { useState } from "react";
import {
  ROBOTS_DIRECTIVES,
  aiCrawlerRules,
  buildRobotsTxt,
  type RobotsConfig,
  type RobotsRule,
} from "@/lib/robotsConfig";
import { saveRobotsAction } from "../_actions/siteFiles";

const inputClass =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all";

export default function RobotsEditor({
  initial,
  siteUrl,
}: {
  initial: RobotsConfig;
  siteUrl: string;
}) {
  const [config, setConfig] = useState<RobotsConfig>(initial);

  function patch(changes: Partial<RobotsConfig>) {
    setConfig((prev) => ({ ...prev, ...changes }));
  }

  function updateRule(index: number, changes: Partial<RobotsRule>) {
    patch({
      rules: config.rules.map((rule, i) => (i === index ? { ...rule, ...changes } : rule)),
    });
  }

  const aiBlocked = aiCrawlerRules().every((ai) =>
    config.rules.some(
      (rule) => rule.userAgent === ai.userAgent && rule.directive === "Disallow",
    ),
  );

  function toggleAiCrawlers() {
    if (aiBlocked) {
      const names = new Set(aiCrawlerRules().map((r) => r.userAgent));
      patch({ rules: config.rules.filter((rule) => !names.has(rule.userAgent)) });
    } else {
      const existing = new Set(config.rules.map((r) => r.userAgent));
      patch({
        rules: [...config.rules, ...aiCrawlerRules().filter((r) => !existing.has(r.userAgent))],
      });
    }
  }

  // Rendered by the same function the route uses, so the preview is the file.
  const preview = buildRobotsTxt(config, siteUrl);

  return (
    <form action={saveRobotsAction} className="space-y-5">
      <input type="hidden" name="config" value={JSON.stringify(config)} />

      <div className="flex flex-wrap gap-2">
        {(["rules", "raw"] as const).map((mode) => (
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
            {mode === "rules" ? "Rule builder" : "Edit as text"}
          </button>
        ))}
      </div>

      {config.mode === "rules" ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="hidden sm:grid sm:grid-cols-[1.2fr_1fr_1.4fr_auto] gap-2 px-1">
              <span className="text-xs font-semibold text-white/50">User agent</span>
              <span className="text-xs font-semibold text-white/50">Directive</span>
              <span className="text-xs font-semibold text-white/50">Path / value</span>
              <span />
            </div>

            {config.rules.map((rule, index) => (
              <div
                key={index}
                className="grid sm:grid-cols-[1.2fr_1fr_1.4fr_auto] gap-2 items-center"
              >
                <input
                  value={rule.userAgent}
                  onChange={(e) => updateRule(index, { userAgent: e.target.value })}
                  placeholder="*"
                  className={inputClass}
                />
                <select
                  value={rule.directive}
                  onChange={(e) =>
                    updateRule(index, { directive: e.target.value as RobotsRule["directive"] })
                  }
                  className={inputClass}
                >
                  {ROBOTS_DIRECTIVES.map((directive) => (
                    <option key={directive} value={directive}>
                      {directive}
                    </option>
                  ))}
                </select>
                <input
                  value={rule.value}
                  onChange={(e) => updateRule(index, { value: e.target.value })}
                  placeholder={rule.directive === "Crawl-delay" ? "10" : "/private"}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => patch({ rules: config.rules.filter((_, i) => i !== index) })}
                  className="text-sm font-semibold text-red-400 hover:text-red-300 px-2"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() =>
                patch({
                  rules: [
                    ...config.rules,
                    { userAgent: "*", directive: "Disallow", value: "" },
                  ],
                })
              }
              className="text-sm font-semibold text-[#c5eb02] hover:underline"
            >
              + Add rule
            </button>
            <button
              type="button"
              onClick={toggleAiCrawlers}
              className="text-sm font-semibold text-white/70 hover:text-white"
            >
              {aiBlocked ? "Allow AI crawlers again" : "Block AI training crawlers"}
            </button>
          </div>

          <label className="flex items-start gap-2 text-sm text-white/70">
            <input
              type="checkbox"
              checked={config.includeSitemap}
              onChange={(e) => patch({ includeSitemap: e.target.checked })}
              className="accent-[#c5eb02] mt-1"
            />
            <span>
              Add the Sitemap line
              <span className="block text-xs text-white/40">
                Points crawlers at {siteUrl}/sitemap.xml. Keep this on.
              </span>
            </span>
          </label>
        </div>
      ) : (
        <div>
          <label className="block text-xs font-semibold text-white/70 mb-1">
            robots.txt contents
          </label>
          <textarea
            value={config.raw || buildRobotsTxt({ ...config, mode: "rules" }, siteUrl)}
            onChange={(e) => patch({ raw: e.target.value })}
            rows={14}
            spellCheck={false}
            className={`${inputClass} font-mono text-xs leading-relaxed`}
          />
          <p className="text-xs text-white/40 mt-1">
            Served exactly as written. A stray <code className="bg-white/5 px-1 rounded">Disallow: /</code>{" "}
            here will deindex the whole site, so read it back before saving.
          </p>
        </div>
      )}

      <div>
        <p className="text-xs font-semibold text-white/70 mb-1">Preview</p>
        <pre className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white/60 font-mono overflow-x-auto whitespace-pre-wrap">
          {preview}
        </pre>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          className="rounded-lg bg-[#c5eb02] text-black text-sm font-semibold px-6 py-3 hover:bg-[#c5eb02]/80"
        >
          Save robots.txt
        </button>
        <a
          href="/robots.txt"
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
