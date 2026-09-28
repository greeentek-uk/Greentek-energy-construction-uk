import { getFocusKeyword } from "@/lib/db/focusKeywords";
import { saveFocusKeywordAction } from "../_actions/focusKeywords";

/**
 * The page's focus keyword, pinned near the top of its editor so it's in view
 * while writing the copy. Panel only — see lib/db/focusKeywords.ts.
 *
 * Its own small form with its own Save, so it must sit outside the page's main
 * form (forms can't nest); every editor renders it in the header area.
 */
export default async function FocusKeywordBox({
  path,
  returnTo,
  saved,
}: {
  /** The public page this keyword is for, e.g. /locations/cardiff. */
  path: string;
  /** This editor's URL, to come back to after saving. */
  returnTo: string;
  saved?: boolean;
}) {
  const keyword = await getFocusKeyword(path);

  return (
    <form
      action={saveFocusKeywordAction}
      className="mb-6 rounded-xl border border-[#c5eb02]/30 bg-[#c5eb02]/5 p-4"
    >
      <input type="hidden" name="path" value={path} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <label htmlFor={`focus-${path}`} className="text-sm font-bold text-[#c5eb02]">
          Focus keyword
        </label>
        <span className="text-[11px] text-white/45">
          Panel only — never shown on the website
        </span>
      </div>
      <div className="flex gap-2">
        <input
          id={`focus-${path}`}
          name="focusKeyword"
          defaultValue={keyword}
          maxLength={120}
          placeholder="e.g. air source heat pump installers cardiff"
          className="min-w-0 flex-1 rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg border border-[#c5eb02]/50 px-4 py-2 text-sm font-semibold text-[#c5eb02] hover:bg-[#c5eb02]/10"
        >
          Save keyword
        </button>
      </div>
      {saved && <p className="mt-2 text-xs text-green-400">Keyword saved.</p>}
    </form>
  );
}
