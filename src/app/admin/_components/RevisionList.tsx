import { restoreRevisionAction } from "../_actions/revisions";
import ConfirmSubmitButton from "./ConfirmSubmitButton";
import { REVISIONS_KEPT, type Revision } from "@/lib/db/revisions";

function when(value: string): string {
  const date = new Date(value);
  const minutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)} hr ago`;
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Restore points for one item, newest first. */
export default function RevisionList({ revisions }: { revisions: Revision[] }) {
  if (revisions.length === 0) return null;

  return (
    <details className="border border-white/10 rounded-lg bg-white/5">
      <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-white hover:bg-white/5">
        Version history ({revisions.length})
      </summary>
      <div className="px-4 pb-4 space-y-2">
        <p className="text-xs text-white/40">
          Each save keeps a copy of what was there before. The last {REVISIONS_KEPT} are
          kept; restoring one is itself saved, so you can always undo the undo.
        </p>
        {revisions.map((revision) => (
          <div
            key={revision.id}
            className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-black/30 px-3 py-2"
          >
            <span className="text-xs text-white/60">
              Before the save {when(revision.savedAt)}
            </span>
            <form action={restoreRevisionAction}>
              <input type="hidden" name="id" value={revision.id} />
              <ConfirmSubmitButton
                message="Restore this version? The current one is saved first, so this can be undone."
                className="text-xs font-semibold text-[#c5eb02] hover:underline"
              >
                Restore
              </ConfirmSubmitButton>
            </form>
          </div>
        ))}
      </div>
    </details>
  );
}
