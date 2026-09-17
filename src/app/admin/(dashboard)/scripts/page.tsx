import { getHeadScripts } from "@/lib/db/headScripts";
import { getMetaPixelSettings } from "@/lib/db/metaPixel";
import { getClaritySettings } from "@/lib/db/clarity";
import { getGoogleAnalyticsSettings } from "@/lib/db/googleAnalytics";
import { extractOrigins, scriptConsentOf } from "@/lib/headScripts";
import {
  deleteScriptAction,
  toggleScriptAction,
  saveAllowedDomainsAction,
  saveMetaPixelAction,
  saveClarityAction,
  saveGoogleAnalyticsAction,
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

const CONSENT_LABEL: Record<string, string> = {
  necessary: "No consent needed",
  analytics: "Waits for analytics consent",
  marketing: "Waits for marketing consent",
};

const PLACEMENT_LABEL: Record<string, string> = {
  head: "Head",
  "body-start": "Body start",
  "body-end": "Body end",
};

export default async function ScriptsAdminPage({ searchParams }: Props) {
  const params = await searchParams;
  const [{ entries, allowedDomains }, metaPixel, clarity, googleAnalytics] = await Promise.all([
    getHeadScripts(),
    getMetaPixelSettings(),
    getClaritySettings(),
    getGoogleAnalyticsSettings(),
  ]);
  const duplicateGaSnippet = entries.some(
    (e) => e.enabled && /googletagmanager\.com\/gtag\/js\?id=G-/i.test(e.raw),
  );
  const duplicateClaritySnippet = entries.some(
    (e) => e.enabled && /clarity\.ms\/tag|["']clarity["']\s*,\s*["']script["']/.test(e.raw),
  );
  const capiConfigured = Boolean(process.env.META_CAPI_ACCESS_TOKEN);
  // A pasted Meta snippet alongside the built-in pixel would count every page
  // view twice, and its events carry no ids for Meta to match.
  const duplicateMetaSnippet = entries.some(
    (e) => e.enabled && /fbq\(\s*['"]init['"]/.test(e.raw),
  );

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

      <div className="bg-[#101314] border border-white/10 rounded-xl p-6 mb-8">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
          <h2 className="font-bold text-white">Meta Pixel</h2>
          <div className="flex flex-wrap gap-2">
            <span
              className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                metaPixel.pixelId ? "text-green-400 bg-green-500/10" : "text-white/40 bg-white/5"
              }`}
            >
              Browser {metaPixel.pixelId ? "on" : "off"}
            </span>
            <span
              className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                metaPixel.pixelId && capiConfigured
                  ? "text-green-400 bg-green-500/10"
                  : "text-amber-300 bg-amber-500/10"
              }`}
            >
              Server {metaPixel.pixelId && capiConfigured ? "on" : "off"}
            </span>
          </div>
        </div>
        <p className="text-white/50 text-sm mb-4">
          Tracks page views, service views, enquiry starts, enquiries, phone and email clicks
          and thank-you page visits — in the browser, and again from the server so events
          still count when the browser copy is blocked. Meta matches the two and counts each
          once.
        </p>

        {duplicateMetaSnippet && (
          <p className="mb-4 text-sm text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3">
            A Meta Pixel snippet is still switched on in the scripts below. Pause it — this card
            already loads the pixel, and running both counts every page view twice.
          </p>
        )}

        <form action={saveMetaPixelAction} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">Pixel ID</label>
              <input
                name="pixelId"
                defaultValue={metaPixel.pixelId}
                inputMode="numeric"
                placeholder="1577042587531420"
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">
                Test event code (optional)
              </label>
              <input
                name="testEventCode"
                defaultValue={metaPixel.testEventCode}
                placeholder="TEST12345"
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all font-mono"
              />
              <p className="text-xs text-white/40 mt-1">
                From Events Manager → Test events. Clear it when you&apos;re done, or server
                events keep going to the test view.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1">
              Cookie consent
            </label>
            <select
              name="consent"
              defaultValue={metaPixel.consent}
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
            >
              <option value="necessary">Necessary — runs for every visitor</option>
              <option value="marketing">
                Marketing — waits until the visitor accepts marketing cookies
              </option>
            </select>
            <p className="text-xs text-white/40 mt-1">
              Necessary keeps campaign tracking complete, and the banner and privacy policy say
              so. UK cookie rules (PECR) treat advertising pixels as optional, so Marketing is
              the fully compliant setting.
            </p>
          </div>

          {!capiConfigured && (
            <p className="text-xs text-white/50">
              Server-side tracking is off because{" "}
              <code className="bg-white/5 px-1 rounded">META_CAPI_ACCESS_TOKEN</code> isn&apos;t
              set. Generate one in Events Manager → your pixel → Settings → Conversions API, and
              add it to the hosting environment. It&apos;s kept out of this panel on purpose:
              it can write events into your ad account.
            </p>
          )}

          <button
            type="submit"
            className="rounded-lg bg-[#c5eb02] text-black text-sm font-semibold px-5 py-2.5 hover:bg-[#c5eb02]/80"
          >
            Save Meta Pixel
          </button>
        </form>
      </div>

      <div className="bg-[#101314] border border-white/10 rounded-xl p-6 mb-8">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
          <h2 className="font-bold text-white">Google Analytics 4</h2>
          <span
            className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
              googleAnalytics.measurementId
                ? "text-green-400 bg-green-500/10"
                : "text-white/40 bg-white/5"
            }`}
          >
            {googleAnalytics.measurementId ? "On" : "Off"}
          </span>
        </div>
        <p className="text-white/50 text-sm mb-4">
          Visits and page views, once a visitor accepts analytics cookies. Also records
          start_quote, generate_lead (thank-you page), contact (phone or email click) and
          view_service — mark generate_lead as a key event in GA4 to count enquiries.
        </p>
        {duplicateGaSnippet && (
          <p className="mb-4 text-sm text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3">
            A Google Analytics snippet is still switched on in the scripts below. Pause it — this
            card already loads GA4, and running both counts every visit twice.
          </p>
        )}
        <form action={saveGoogleAnalyticsAction} className="flex flex-wrap items-end gap-4">
          <div className="min-w-[220px] flex-1">
            <label className="block text-xs font-semibold text-white/70 mb-1">
              Measurement ID
            </label>
            <input
              name="measurementId"
              defaultValue={googleAnalytics.measurementId}
              placeholder="G-WMBE8DEKZ7"
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all font-mono"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-[#c5eb02] text-black text-sm font-semibold px-5 py-2.5 hover:bg-[#c5eb02]/80"
          >
            Save Google Analytics
          </button>
        </form>
      </div>

      <div className="bg-[#101314] border border-white/10 rounded-xl p-6 mb-8">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
          <h2 className="font-bold text-white">Microsoft Clarity</h2>
          <span
            className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
              clarity.projectId ? "text-green-400 bg-green-500/10" : "text-white/40 bg-white/5"
            }`}
          >
            {clarity.projectId ? "On" : "Off"}
          </span>
        </div>
        <p className="text-white/50 text-sm mb-4">
          Session recordings and heatmaps, once a visitor accepts analytics cookies. Enquiry starts, enquiries and phone or email clicks
          are tagged on each recording, so you can filter straight to the sessions that
          converted.
        </p>
        {duplicateClaritySnippet && (
          <p className="mb-4 text-sm text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3">
            A Clarity snippet is still switched on in the scripts below. Pause it — this card
            already loads Clarity.
          </p>
        )}
        <form action={saveClarityAction} className="flex flex-wrap items-end gap-4">
          <div className="min-w-[220px] flex-1">
            <label className="block text-xs font-semibold text-white/70 mb-1">Project ID</label>
            <input
              name="clarityProjectId"
              defaultValue={clarity.projectId}
              placeholder="yjfzqaq5fv"
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all font-mono"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-[#c5eb02] text-black text-sm font-semibold px-5 py-2.5 hover:bg-[#c5eb02]/80"
          >
            Save Clarity
          </button>
        </form>
      </div>

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
                  {entry.tags.length === 1 ? "" : "s"} · {CONSENT_LABEL[scriptConsentOf(entry)]}
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
