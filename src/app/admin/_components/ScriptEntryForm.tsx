"use client";

import { useState } from "react";
import {
  parseSnippet,
  extractOrigins,
  scriptConsentOf,
  type ScriptEntry,
} from "@/lib/headScripts";
import { saveScriptAction } from "../_actions/scripts";

const PLACEMENTS = [
  { value: "head", label: "Head — before the page renders (GTM, GA4, consent tools)" },
  { value: "body-start", label: "Body start — right after <body> opens (GTM noscript)" },
  { value: "body-end", label: "Body end — after the page content (chat widgets, non-critical)" },
];

const CONSENTS = [
  {
    value: "analytics",
    label: "Analytics — after the visitor accepts analytics cookies (GA4, Hotjar)",
  },
  {
    value: "marketing",
    label: "Marketing — after the visitor accepts marketing cookies (TikTok, LinkedIn, Google Ads)",
  },
  {
    value: "necessary",
    label: "Necessary — for everyone, no consent asked (only what the site can't work without)",
  },
];

/**
 * Paste-a-snippet form. Parsing runs live in the browser so the admin can see
 * exactly which tags will be created and which origins they'll need allowlisted
 * before they save — the same parser runs again server-side on submit.
 */
export default function ScriptEntryForm({
  entry,
  allowedDomains,
  onCancel,
}: {
  entry?: ScriptEntry;
  allowedDomains: string[];
  onCancel?: () => void;
}) {
  const [raw, setRaw] = useState(entry?.raw ?? "");

  const tags = raw.trim() ? parseSnippet(raw) : [];
  const origins = tags.length
    ? extractOrigins([{ ...(entry ?? ({} as ScriptEntry)), tags } as ScriptEntry])
    : [];
  const missing = origins.filter((o) => !allowedDomains.includes(o));

  return (
    <form action={saveScriptAction} className="space-y-4">
      {entry && <input type="hidden" name="id" value={entry.id} />}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-white/70 mb-1">Name</label>
          <input
            name="name"
            defaultValue={entry?.name}
            required
            placeholder="Google Tag Manager"
            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-white/70 mb-1">Placement</label>
          <select
            name="placement"
            defaultValue={entry?.placement ?? "head"}
            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
          >
            {PLACEMENTS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-white/70 mb-1">
          Cookie consent — when this runs
        </label>
        <select
          name="consent"
          defaultValue={entry ? scriptConsentOf(entry) : "analytics"}
          className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
        >
          {CONSENTS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-white/40 mt-1">
          UK law requires a visitor to agree before trackers run. Only choose Necessary for
          things like a chat widget — never for analytics or advertising tags.
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-white/70 mb-1">
          Snippet — paste the whole thing, including the &lt;script&gt; tags
        </label>
        <textarea
          name="raw"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          required
          rows={10}
          spellCheck={false}
          placeholder={'<!-- Google tag (gtag.js) -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXX"></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  ...\n</script>'}
          className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all font-mono leading-relaxed"
        />
      </div>

      {raw.trim() && (
        <div className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-2">
          {tags.length === 0 ? (
            <p className="text-xs text-red-400">
              ✕ No &lt;script&gt; or &lt;noscript&gt; tag found. Paste the full snippet, or
              paste bare JavaScript on its own.
            </p>
          ) : (
            <>
              <p className="text-xs text-green-400">
                ✓ {tags.length} tag{tags.length === 1 ? "" : "s"} will be added:
              </p>
              <ul className="text-xs text-white/60 space-y-1 font-mono">
                {tags.map((tag, i) => (
                  <li key={i}>
                    {tag.noscript
                      ? "<noscript> fallback"
                      : tag.src
                        ? `<script src="${tag.src}">`
                        : `<script> inline, ${tag.code?.length ?? 0} chars`}
                  </li>
                ))}
              </ul>
            </>
          )}

          {missing.length > 0 && (
            <p className="text-xs text-amber-300">
              ⚠ Add {missing.join(", ")} to the allowed script domains below, or the browser
              will block {missing.length === 1 ? "it" : "them"}.
            </p>
          )}
        </div>
      )}

      <label className="flex items-center gap-2 text-sm text-white/70">
        <input
          type="checkbox"
          name="enabled"
          defaultChecked={entry?.enabled ?? true}
          className="accent-[#c5eb02]"
        />
        Enabled — load this on the live site
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="rounded-lg bg-[#c5eb02] text-black text-sm font-semibold px-5 py-2.5 hover:bg-[#c5eb02]/80"
        >
          {entry ? "Save Script" : "Add Script"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-white/50 hover:text-white"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
