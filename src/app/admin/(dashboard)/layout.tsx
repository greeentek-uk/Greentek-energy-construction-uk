import Link from "next/link";
import { logoutAction } from "../_actions/auth";
import { publishAllAction } from "../_actions/pageContent";
import { listBlocksWithDirty } from "@/lib/db/pageContent";
import ConfirmSubmitButton from "../_components/ConfirmSubmitButton";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/seo", label: "Page SEO" },
  { href: "/admin/page-content", label: "Page Content" },
  { href: "/admin/blog", label: "Blog Posts" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/locations", label: "Locations" },
  { href: "/admin/settings", label: "Company Settings" },
];

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const blocks = await listBlocksWithDirty();
  const dirtyCount = blocks.filter((b) => b.dirty).length;

  return (
    <div className="min-h-screen bg-black text-white flex">
      <aside className="w-64 shrink-0 bg-black border-r border-white/10 flex flex-col">
        <div className="px-5 py-5 border-b border-white/10">
          <p className="font-bold text-lg">Greentek Admin</p>
          <p className="text-xs text-white/50">Content management</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            >
              {item.label}
              {item.href === "/admin/page-content" && dirtyCount > 0 && (
                <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                  {dirtyCount}
                </span>
              )}
            </Link>
          ))}
        </nav>
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
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>
    </div>
  );
}
