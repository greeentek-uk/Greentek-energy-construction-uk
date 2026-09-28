import { redirect } from "next/navigation";

/**
 * The old list of eleven collapsed forms. Each location + service page now has
 * its own editor, listed on the location's page; this keeps old bookmarks working.
 */
export default async function LocationServiceContentPage({
  params,
}: {
  params: Promise<{ locationSlug: string }>;
}) {
  const { locationSlug } = await params;
  redirect(`/admin/locations/${locationSlug}#services`);
}
