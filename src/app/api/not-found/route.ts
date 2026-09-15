import { NextResponse } from "next/server";
import { recordNotFound } from "@/lib/db/notFoundLog";

/**
 * Records a 404 hit, reported by the not-found page from the browser.
 *
 * This is a POST from the client rather than a server-side write inside
 * `not-found.tsx` because reading request headers there flips statically
 * prerendered routes to dynamic at runtime, which Next rejects outright — the
 * page 500s instead of 404ing. Reporting from the browser keeps every page
 * static and still captures the path and referrer.
 */
export async function POST(request: Request): Promise<Response> {
  let body: { path?: unknown; referrer?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const path = typeof body.path === "string" ? body.path : "";

  // Only same-site paths, and only a sane length — this endpoint is public, so
  // it must not become a way to write arbitrary rows into the log.
  if (!path.startsWith("/") || path.startsWith("//") || path.length > 512) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const referrer =
    typeof body.referrer === "string" && body.referrer.length <= 512
      ? body.referrer
      : null;

  try {
    await recordNotFound(path, referrer || null);
  } catch {
    // A logging failure must never surface to the visitor.
  }

  return NextResponse.json({ ok: true });
}
