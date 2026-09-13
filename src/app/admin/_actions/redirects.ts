"use server";

import { redirect } from "next/navigation";
import {
  upsertRedirect,
  deleteRedirect,
  getRedirects,
  type RedirectStatus,
} from "@/lib/db/redirects";
import {
  markNotFoundResolved,
  deleteNotFoundEntry,
  clearResolvedNotFound,
} from "@/lib/db/notFoundLog";

const STATUSES: RedirectStatus[] = [301, 302, 307, 410];

function fail(message: string): never {
  redirect(`/admin/redirects?error=${encodeURIComponent(message)}`);
}

function normalizePath(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export async function saveRedirectAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") || "").trim();
  const source = normalizePath(String(formData.get("source") || ""));
  const destination = normalizePath(String(formData.get("destination") || ""));
  const status = Number(formData.get("status") || 301) as RedirectStatus;
  const enabled = formData.get("enabled") === "on";
  const resolvePath = String(formData.get("resolveNotFound") || "").trim();

  if (!source) fail("Enter the old path to redirect from.");
  if (!STATUSES.includes(status)) fail("Unknown redirect type.");
  if (status !== 410 && !destination) fail("Enter where the old path should go.");
  if (source.startsWith("/admin")) {
    fail("Refusing to redirect an /admin path — that would lock you out of this panel.");
  }
  if (source === destination) fail("Source and destination are the same — that would loop.");

  const existing = id ? (await getRedirects()).find((r) => r.id === id) : undefined;

  try {
    await upsertRedirect({
      id: id || `rd_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
      source,
      destination: status === 410 ? "" : destination,
      status,
      enabled,
      hits: existing?.hits ?? 0,
      lastHitAt: existing?.lastHitAt ?? null,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    });

    // Created straight from a logged 404 — mark that entry handled.
    if (resolvePath) await markNotFoundResolved(resolvePath);
  } catch (err) {
    fail(err instanceof Error ? err.message : "Unknown error");
  }

  redirect("/admin/redirects?saved=1");
}

export async function deleteRedirectAction(formData: FormData): Promise<void> {
  await deleteRedirect(String(formData.get("id") || ""));
  redirect("/admin/redirects?deleted=1");
}

export async function dismissNotFoundAction(formData: FormData): Promise<void> {
  await deleteNotFoundEntry(String(formData.get("path") || ""));
  redirect("/admin/redirects?dismissed=1");
}

export async function clearResolvedNotFoundAction(): Promise<void> {
  const removed = await clearResolvedNotFound();
  redirect(`/admin/redirects?cleared=${removed}`);
}
