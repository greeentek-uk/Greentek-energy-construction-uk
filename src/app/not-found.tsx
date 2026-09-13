import Link from "next/link";
import { headers } from "next/headers";
import { recordNotFound } from "@/lib/db/notFoundLog";
import { PATHNAME_HEADER } from "@/proxy";

/**
 * 404 page, which doubles as the monitor feeding /admin/redirects.
 *
 * Reading headers() makes this route dynamic — that's fine and necessary here,
 * since a 404 is never prerendered, and it's what lets us record the URL that
 * was actually requested.
 */
export default async function NotFound() {
  const headerList = await headers();
  const path = headerList.get(PATHNAME_HEADER);

  if (path) {
    try {
      await recordNotFound(path, headerList.get("referer"));
    } catch {
      // Logging a miss must never turn a 404 into a 500.
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-[#c5eb02]">404</p>
      <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
        We couldn&apos;t find that page
      </h1>
      <p className="mt-3 max-w-md text-white/60">
        It may have moved, or the link that brought you here may be out of date.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-lg bg-[#c5eb02] px-6 py-3 text-sm font-semibold text-black hover:bg-[#c5eb02]/80"
        >
          Back to home
        </Link>
        <Link
          href="/contact"
          className="rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:border-white/40"
        >
          Contact us
        </Link>
      </div>
    </div>
  );
}
