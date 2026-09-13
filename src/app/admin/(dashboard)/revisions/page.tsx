import { getRecentRevisions, REVISIONS_KEPT } from "@/lib/db/revisions";
import { restoreRevisionAction } from "../../_actions/revisions";
import SaveBanner from "../../_components/SaveBanner";
import ConfirmSubmitButton from "../../_components/ConfirmSubmitButton";

interface Props {
  searchParams: Promise<{ restored?: string; error?: string }>;
}

const SCOPE_LABELS: Record<string, string> = {
  pages: "Page",
  blogPosts: "Blog post",
  services: "Service",
  locations: "Location",
  projects: "Project",
  pageContent: "Section",
  settings: "Settings",
};

export default async function RevisionsPage({ searchParams }: Props) {
  const [params, revisions] = await Promise.all([searchParams, getRecentRevisions()]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Version History</h1>
      <p className="text-white/50 mb-6 text-sm">
        Every save keeps a copy of what was there before it. The last {REVISIONS_KEPT}{" "}
        versions of each item are kept — enough to walk back a bad editing session without
        the database filling up. Restoring is itself saved, so it can be undone.
      </p>

      {params.restored && (
        <div className="mb-6 text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3">
          Restored <strong>{params.restored}</strong>.
        </div>
      )}
      <SaveBanner error={params.error} />

      {revisions.length === 0 ? (
        <p className="text-sm text-white/40 bg-[#101314] border border-white/10 rounded-xl px-5 py-10 text-center">
          Nothing here yet. History starts building from the next edit you make.
        </p>
      ) : (
        <div className="bg-[#101314] border border-white/10 rounded-xl divide-y divide-white/10">
          {revisions.map((revision) => (
            <div
              key={revision.id}
              className="flex items-center justify-between gap-4 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{revision.label}</p>
                <p className="text-xs text-white/40">
                  {SCOPE_LABELS[revision.scope] ?? revision.scope} ·{" "}
                  {new Date(revision.savedAt).toLocaleString("en-GB", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <form action={restoreRevisionAction} className="shrink-0">
                <input type="hidden" name="id" value={revision.id} />
                <ConfirmSubmitButton
                  message={`Restore "${revision.label}" to this version? The current one is saved first.`}
                  className="text-sm font-semibold text-[#c5eb02] hover:underline"
                >
                  Restore
                </ConfirmSubmitButton>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
