import Link from "next/link";
import { logoutAction } from "../_actions/auth";
import { publishAllAction } from "../_actions/pageContent";
import { listBlocksWithDirty } from "@/lib/db/pageContent";
import ConfirmSubmitButton from "../_components/ConfirmSubmitButton";
import AdminNav from "../_components/AdminNav";
import { getPanelLocation } from "@/lib/revalidate";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [blocks, panel] = await Promise.all([listBlocksWithDirty(), getPanelLocation()]);
  const dirtyCount = blocks.filter((b) => b.dirty).length;

  return (
    <div className="min-h-screen bg-black text-white flex">
      <aside className="sticky top-0 h-screen w-64 shrink-0 bg-black border-r border-white/10 flex flex-col">
        <div className="px-5 py-5 border-b border-white/10">
          <p className="font-bold text-lg">Greentek Admin</p>
          <p className="text-xs text-white/50">Content management</p>
        </div>
        <AdminNav dirtyCount={dirtyCount} />
        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          {dirtyCount > 0 && (
            <form action={publishAllAction}>
              <ConfirmSubmitButton
                message={`Publish ${dirtyCount} changed page content block(s) to the live site?`}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold bg-[#c5eb02] text-black hover:bg-[#c5eb02]/80 transition-colors mb-1"
              >
                Publish Changes ({dirtyCount})
              </ConfirmSubmitButton>
            </form>
          )}
          <Link
            href="/"
            target="_blank"
            className="block px-3 py-2 rounded-lg text-sm font-medium text-white/50 hover:bg-white/10 hover:text-white transition-colors"
          >
            View Live Site ↗
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 min-w-0 px-6 py-8 md:px-10 md:py-10">
        <div className="mx-auto max-w-4xl">
          {/* Edits made away from the live host have to reach it over the
              network to clear its cache. Saying so up front beats the editor
              discovering it when a crawler reports stale content. */}
          {!panel.isLiveHost && (
            <div
              className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
                panel.configured
                  ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
                  : "border-red-500/20 bg-red-500/10 text-red-400"
              }`}
            >
              {panel.configured ? (
                <>
                  You&apos;re editing from <strong>{panel.host}</strong>, not the live site.
                  Changes are pushed to <strong>{panel.liveHost}</strong> as you save — if
                  that ever fails, use <strong>Refresh live site</strong> on the dashboard.
                </>
              ) : (
                <>
                  <strong>REVALIDATE_SECRET isn&apos;t set.</strong> You&apos;re editing from{" "}
                  {panel.host}, so changes will update the database but{" "}
                  <strong>{panel.liveHost}</strong> will keep serving its old pages. Set the
                  same secret here and on the live site, or edit from the live panel.
                </>
              )}
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
