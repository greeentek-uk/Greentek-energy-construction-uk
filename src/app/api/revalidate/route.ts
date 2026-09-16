import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * Lets an admin panel running elsewhere clear this deployment's page cache.
 *
 * Without this, a change saved from a local or preview panel updates the shared
 * database but never tells the live site, which keeps serving prerendered HTML.
 *
 * Guarded by a shared secret: this endpoint can wipe the entire page cache, so
 * an unauthenticated caller could use it to force constant regeneration.
 */
interface Target {
  path?: unknown;
  type?: unknown;
}

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Revalidation is not configured" }, { status: 503 });
  }

  if (request.headers.get("x-revalidate-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { targets?: Target[] };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const targets = Array.isArray(body.targets) ? body.targets : [];
  const cleared: string[] = [];

  for (const target of targets) {
    if (typeof target.path !== "string" || !target.path.startsWith("/")) continue;
    if (target.type === "layout" || target.type === "page") {
      revalidatePath(target.path, target.type);
    } else {
      revalidatePath(target.path);
    }
    cleared.push(target.path);
  }

  // An empty or fully invalid payload means "refresh everything" rather than
  // silently doing nothing, which would look like success.
  if (cleared.length === 0) {
    revalidatePath("/", "layout");
    cleared.push("/ (all pages)");
  }

  return NextResponse.json({ ok: true, cleared });
}
