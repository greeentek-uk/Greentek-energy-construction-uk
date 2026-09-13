import { getHeadScripts } from "@/lib/db/headScripts";
import { extractOrigins } from "@/lib/headScripts";
import {
  deleteScriptAction,
  toggleScriptAction,
  saveAllowedDomainsAction,
} from "../../_actions/scripts";
import SaveBanner from "../../_components/SaveBanner";
import ConfirmSubmitButton from "../../_components/ConfirmSubmitButton";
import ScriptEntryForm from "../../_components/ScriptEntryForm";

interface Props {
  searchParams: Promise<{
    saved?: string;
    deleted?: string;
    domains?: string;
    error?: string;
  }>;
}

const PLACEMENT_LABEL: Record<string, string> = {
  head: "Head",
  "body-start": "Body start",
  "body-end": "Body end",
};

export default async function ScriptsAdminPage({ searchParams }: Props) {
  const params = await searchParams;
  const { entries, allowedDomains } = await getHeadScripts();

  const usedOrigins = extractOrigins(entries.filter((e) => e.enabled));
  const missingDomains = usedOrigins.filter((o) => !allowedDomains.includes(o));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Scripts &amp; Tracking</h1>
      <p className="text-white/50 mb-6 text-sm">
        Add analytics, tag manager, pixel and chat snippets to every page without a code
        change. Paste the snippet exactly as the vendor gives it to you.
      </p>

      <SaveBanner
        saved={params.saved === "1" || params.deleted === "1" || params.domains === "1"}
        error={params.error}
      />

      {missingDomains.length > 0 && (
        <div className="mb-6 text-sm text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3">
          <strong>Blocked by the security policy:</strong> {missingDomains.join(", ")}{" "}
          {missingDomains.length === 1 ? "is" : "are"} used by an enabled script but not in
          the allowed domains list below. Add {missingDomains.length === 1 ? "it" : "them"}{" "}
          or the browser will refuse to load the script.
        </div>
      )}

      <div className="space-y-3 mb-8">
        {entries.length === 0 && (
          <p className="text-sm text-white/40 bg-[#101314] border border-white/10 rounded-xl px-5 py-8 text-center">
            No scripts yet.
          </p>
        )}

        {entries.map((entry) => (
          <div
            key={entry.id}
            className="bg-[#101314] border border-white/10 rounded-xl overflow-hidden"
          >
            <div className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="min-w-0">
                <p className="font-semibold text-white truncate">{entry.name}</p>
                <p className="text-xs text-white/40">
                  {PLACEMENT_LABEL[entry.placement]} · {entry.tags.length} tag
                  {entry.tags.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                    entry.enabled
                      ? "text-green-400 bg-green-500/10"
                      : "text-white/40 bg-white/5"
                  }`}
                >
                  {entry.enabled ? "Live" : "Paused"}
                </span>
                <form action={toggleScriptAction}>
                  <input type="hidden" name="id" value={entry.id} />
                  <button
                    type="submit"
                    className="text-sm font-semibold text-white hover:underline"
                  >
                    {entry.enabled ? "Pause" : "Enable"}
                  </button>
                </form>
                <form action={deleteScriptAction}>
                  <input type="hidden" name="id" value={entry.id} />
                  <ConfirmSubmitButton
                    message={`Delete "${entry.name}"? This cannot be undone.`}
                    className="text-sm font-semibold text-red-400 hover:underline"
                  >
                    Delete
                  </ConfirmSubmitButton>
                </form>
              </div>
            </div>
            <details>
              <summary className="cursor-pointer px-5 py-2 text-sm text-white/50 hover:bg-white/5 border-t border-white/10">
                Edit snippet
              </summary>
              <div className="px-5 pb-5 pt-3">
                <ScriptEntryForm entry={entry} allowedDomains={allowedDomains} />
              </div>
            </details>
          </div>
        ))}
      </div>

      <details className="bg-[#101314] border border-white/10 rounded-xl overflow-hidden mb-8">
        <summary className="cursor-pointer px-5 py-4 font-semibold text-white hover:bg-white/5">
          + Add a script
        </summary>
        <div className="px-5 pb-5 pt-2">
          <ScriptEntryForm allowedDomains={allowedDomains} />
        </div>
      </details>

      <div className="bg-[#101314] border border-white/10 rounded-xl p-6">
        <h2 className="font-bold text-white mb-1">Allowed script domains</h2>
        <p className="text-white/50 text-sm mb-4">
          The site sends a Content-Security-Policy that blocks scripts from anywhere not on
          this list — that&apos;s what stops an injected script from running. Add the
          origins your tags load from, one per line. Tag managers pull in further scripts at
          runtime, so you may need hosts that don&apos;t appear in the snippet itself.
        </p>

        <form action={saveAllowedDomainsAction} className="space-y-3">
          <textarea
            name="allowedDomains"
            defaultValue={allowedDomains.join("\n")}
            rows={6}
            spellCheck={false}
            placeholder={"https://www.googletagmanager.com\nhttps://www.google-analytics.com\nhttps://connect.facebook.net"}
            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all font-mono"
          />
          {usedOrigins.length > 0 && (
            <p className="text-xs text-white/40">
              Detected in your snippets: {usedOrigins.join(", ")}
            </p>
          )}
          <button
            type="submit"
            className="rounded-lg bg-[#c5eb02] text-black text-sm font-semibold px-5 py-2.5 hover:bg-[#c5eb02]/80"
          >
            Save Domains
          </button>
        </form>
      </div>
    </div>
  );
}
