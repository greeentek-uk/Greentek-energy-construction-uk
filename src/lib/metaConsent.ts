import { consentFromCookieHeader } from "@/lib/consent";
import { getMetaPixelSettingsCached } from "@/lib/db/metaPixel";

/**
 * Whether a request's events may go to Meta: always when the owner runs the
 * pixel as necessary, otherwise only if the visitor accepted marketing cookies.
 */
export async function metaAllowedForRequest(request: Request): Promise<boolean> {
  const { consent } = await getMetaPixelSettingsCached();
  if (consent !== "marketing") return true;
  return Boolean(consentFromCookieHeader(request.headers.get("cookie"))?.marketing);
}
