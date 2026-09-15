import Link from "next/link";
import NotFoundLogger from "@/components/site/NotFoundLogger";

/**
 * 404 page.
 *
 * Deliberately has no server-side data access: reading headers or cookies here
 * turns every statically prerendered route dynamic the moment it 404s, which
 * Next treats as an error and serves as a 500. The hit is logged from the
 * browser instead — see NotFoundLogger.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center">
      <NotFoundLogger />
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
