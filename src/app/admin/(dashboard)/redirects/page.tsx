import { getRedirects } from "@/lib/db/redirects";
import { getNotFoundEntries } from "@/lib/db/notFoundLog";
import {
  saveRedirectAction,
  deleteRedirectAction,
  dismissNotFoundAction,
  clearResolvedNotFoundAction,
} from "../../_actions/redirects";
import SaveBanner from "../../_components/SaveBanner";
import ConfirmSubmitButton from "../../_components/ConfirmSubmitButton";

interface Props {
  searchParams: Promise<{
    saved?: string;
    deleted?: string;
    dismissed?: string;
    cleared?: string;
    error?: string;
    from?: string;
  }>;
}

const input =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all";

const STATUS_LABELS: Record<number, string> = {
  301: "301 Permanent",
  302: "302 Temporary",
  307: "307 Temporary (keeps method)",
  410: "410 Gone (no destination)",
};

function when(value: string | null): string {
  if (!value) return "never";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function RedirectsPage({ searchParams }: Props) {
  const [params, redirects, notFound] = await Promise.all([
    searchParams,
    getRedirects(),
    getNotFoundEntries(),
  ]);

  const unresolved = notFound.filter((entry) => !entry.resolved);
  const resolved = notFound.filter((entry) => entry.resolved);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Redirects &amp; 404s</h1>
      <p className="text-white/50 mb-6 text-sm">
        Send old URLs to new ones, and see which missing pages people are actually hitting.
        Redirects run before the page loads and never apply to /admin.
      </p>

      <SaveBanner
        saved={Boolean(params.saved || params.deleted || params.dismissed || params.cleared)}
        error={params.error}
      />

      <section className="mb-10">
        <h2 className="text-sm font-bold uppercase text-white/50 mb-3">
          Redirect rules ({redirects.length})
        </h2>

        <div className="space-y-3 mb-4">
          {redirects.length === 0 && (
            <p className="text-sm text-white/40 bg-[#101314] border border-white/10 rounded-xl px-5 py-8 text-center">
              No redirects yet.
            </p>
          )}

          {redirects.map((rule) => (
            <div
              key={rule.id}
              className="bg-[#101314] border border-white/10 rounded-xl overflow-hidden"
            >
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <p className="font-mono text-sm text-white truncate">
                    {rule.source}
                    {rule.status !== 410 && (
                      <>
                        <span className="text-white/30 mx-2">→</span>
                        {rule.destination}
                      </>
                    )}
                  </p>
                  <p className="text-xs text-white/40">
                    {STATUS_LABELS[rule.status]} · {rule.hits} hit
                    {rule.hits === 1 ? "" : "s"} · last {when(rule.lastHitAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                      rule.enabled
                        ? "text-green-400 bg-green-500/10"
                        : "text-white/40 bg-white/5"
                    }`}
                  >
                    {rule.enabled ? "Active" : "Paused"}
                  </span>
                  <form action={deleteRedirectAction}>
                    <input type="hidden" name="id" value={rule.id} />
                    <ConfirmSubmitButton
                      message={`Delete the redirect for ${rule.source}?`}
                      className="text-sm font-semibold text-red-400 hover:underline"
                    >
                      Delete
                    </ConfirmSubmitButton>
                  </form>
                </div>
              </div>
              <details>
                <summary className="cursor-pointer px-5 py-2 text-sm text-white/50 hover:bg-white/5 border-t border-white/10">
                  Edit
                </summary>
                <div className="px-5 pb-5 pt-3">
                  <RedirectFields rule={rule} />
                </div>
              </details>
            </div>
          ))}
        </div>

        <details
          open={Boolean(params.from)}
          className="bg-[#101314] border border-white/10 rounded-xl overflow-hidden"
        >
          <summary className="cursor-pointer px-5 py-4 font-semibold text-white hover:bg-white/5">
            + Add a redirect
          </summary>
          <div className="px-5 pb-5 pt-2">
            <RedirectFields presetSource={params.from} />
          </div>
        </details>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase text-white/50">
            404s logged ({unresolved.length})
          </h2>
          {resolved.length > 0 && (
            <form action={clearResolvedNotFoundAction}>
              <button
                type="submit"
                className="text-sm font-semibold text-white/50 hover:text-white"
              >
                Clear {resolved.length} handled
              </button>
            </form>
          )}
        </div>

        {unresolved.length === 0 ? (
          <p className="text-sm text-white/40 bg-[#101314] border border-white/10 rounded-xl px-5 py-8 text-center">
            No missing pages recorded. Hits are logged automatically as they happen.
          </p>
        ) : (
          <div className="bg-[#101314] border border-white/10 rounded-xl divide-y divide-white/10">
            {unresolved.map((entry) => (
              <div
                key={entry.path}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-mono text-sm text-white truncate">{entry.path}</p>
                  <p className="text-xs text-white/40 truncate">
                    {entry.hits} hit{entry.hits === 1 ? "" : "s"} · last{" "}
                    {when(entry.lastSeenAt)}
                    {entry.referrer ? ` · from ${entry.referrer}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <a
                    href={`/admin/redirects?from=${encodeURIComponent(entry.path)}`}
                    className="text-sm font-semibold text-[#c5eb02] hover:underline"
                  >
                    Redirect
                  </a>
                  <form action={dismissNotFoundAction}>
                    <input type="hidden" name="path" value={entry.path} />
                    <button
                      type="submit"
                      className="text-sm font-semibold text-white/50 hover:text-white"
                    >
                      Dismiss
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function RedirectFields({
  rule,
  presetSource,
}: {
  rule?: Awaited<ReturnType<typeof getRedirects>>[number];
  presetSource?: string;
}) {
  return (
    <form action={saveRedirectAction} className="space-y-4">
      {rule && <input type="hidden" name="id" value={rule.id} />}
      {presetSource && <input type="hidden" name="resolveNotFound" value={presetSource} />}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-white/70 mb-1">
            Old path
          </label>
          <input
            name="source"
            defaultValue={rule?.source ?? presetSource ?? ""}
            required
            placeholder="/old-page"
            className={`${input} font-mono`}
          />
          <p className="text-xs text-white/40 mt-1">
            End with <code className="bg-white/5 px-1 rounded">*</code> to match everything
            beneath it.
          </p>
        </div>
        <div>
          <label className="block text-xs font-semibold text-white/70 mb-1">
            New path
          </label>
          <input
            name="destination"
            defaultValue={rule?.destination ?? ""}
            placeholder="/new-page"
            className={`${input} font-mono`}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 items-end">
        <div>
          <label className="block text-xs font-semibold text-white/70 mb-1">Type</label>
          <select name="status" defaultValue={rule?.status ?? 301} className={input}>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-white/70 pb-2">
          <input
            type="checkbox"
            name="enabled"
            defaultChecked={rule?.enabled ?? true}
            className="accent-[#c5eb02]"
          />
          Active
        </label>
      </div>

      <button
        type="submit"
        className="rounded-lg bg-[#c5eb02] text-black text-sm font-semibold px-5 py-2.5 hover:bg-[#c5eb02]/80"
      >
        {rule ? "Save Redirect" : "Add Redirect"}
      </button>
    </form>
  );
}
