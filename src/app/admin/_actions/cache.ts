"use server";

import { redirect } from "next/navigation";
import { revalidateEverything, getLastSyncError } from "@/lib/revalidate";

/**
 * Manual escape hatch for the panel.
 *
 * Revalidation is event-driven — a save clears exactly what it changed and the
 * result stays cached until the next change. If one of those calls ever fails
 * (the live site mid-deploy, a network blip), this clears everything rather
 * than waiting for a timer that deliberately doesn't exist.
 */
export async function refreshLiveSiteAction(): Promise<void> {
  await revalidateEverything();

  const error = getLastSyncError();
  redirect(
    error
      ? `/admin?cache=error&message=${encodeURIComponent(error)}`
      : "/admin?cache=refreshed",
  );
}
