import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { getAllowedScriptDomainsCached } from "@/lib/db/headScripts";
import { getRedirectsCached, matchRedirect, recordRedirectHit } from "@/lib/db/redirects";
import { buildCsp } from "@/lib/csp";

// Proxy always runs on the Node.js runtime, so Node's crypto module and the
// Mongo driver are both safe to use here.
export const config = {
  matcher: [
    // Everything except Next's own static output and the files it serves as-is.
    "/((?!_next/static|_next/image|favicon.ico|images/|animations/).*)",
  ],
};

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname !== "/admin/login") {
      const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
      if (!verifySessionToken(token)) {
        const loginUrl = new URL("/admin/login", request.url);
        loginUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
  } else {
    // Admin routes are skipped so a redirect rule can never lock the panel out.
    const match = matchRedirect(pathname, await getRedirectsCached());
    if (match) {
      if (match.rule.status === 410) {
        return new NextResponse("Gone", { status: 410 });
      }

      const destination = match.destination.startsWith("http")
        ? new URL(match.destination)
        : new URL(`${match.destination}${search}`, request.url);

      // Counted but not awaited — the visitor shouldn't wait on a stats write.
      void recordRedirectHit(match.rule.id);

      return NextResponse.redirect(destination, match.rule.status);
    }
  }

  const response = NextResponse.next();

  // Built per request from the admin's allowlist (cached for a minute) so a tag
  // added in the panel actually runs, instead of being silently blocked by a
  // policy frozen at build time.
  const allowedDomains = await getAllowedScriptDomainsCached();
  response.headers.set("Content-Security-Policy", buildCsp(allowedDomains));

  return response;
}
