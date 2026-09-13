"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getHeadScripts, saveHeadScripts } from "@/lib/db/headScripts";
import {
  normalizeDomains,
  parseSnippet,
  type ScriptEntry,
  type ScriptPlacement,
} from "@/lib/headScripts";

const PLACEMENTS: ScriptPlacement[] = ["head", "body-start", "body-end"];

function fail(message: string): never {
  redirect(`/admin/scripts?error=${encodeURIComponent(message)}`);
}

function newId(): string {
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function saveScriptAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const raw = String(formData.get("raw") || "").trim();
  const placement = String(formData.get("placement") || "head") as ScriptPlacement;
  const enabled = formData.get("enabled") === "on";

  if (!name) fail("Give the script a name so you can recognise it later.");
  if (!raw) fail("Paste the snippet before saving.");
  if (!PLACEMENTS.includes(placement)) fail("Unknown placement.");

  const tags = parseSnippet(raw);
  if (!tags.length) {
    fail("Couldn't find a <script> or <noscript> tag in that snippet.");
  }

  const config = await getHeadScripts();
  const entry: ScriptEntry = {
    id: id || newId(),
    name,
    enabled,
    placement,
    tags,
    raw,
    updatedAt: new Date().toISOString(),
  };

  const entries = id
    ? config.entries.map((e) => (e.id === id ? entry : e))
    : [...config.entries, entry];

  await saveHeadScripts({ ...config, entries });

  revalidatePath("/", "layout");
  redirect("/admin/scripts?saved=1");
}

export async function toggleScriptAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") || "");
  const config = await getHeadScripts();

  await saveHeadScripts({
    ...config,
    entries: config.entries.map((e) => (e.id === id ? { ...e, enabled: !e.enabled } : e)),
  });

  revalidatePath("/", "layout");
  redirect("/admin/scripts?saved=1");
}

export async function deleteScriptAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") || "");
  const config = await getHeadScripts();

  await saveHeadScripts({
    ...config,
    entries: config.entries.filter((e) => e.id !== id),
  });

  revalidatePath("/", "layout");
  redirect("/admin/scripts?deleted=1");
}

export async function saveAllowedDomainsAction(formData: FormData): Promise<void> {
  const raw = String(formData.get("allowedDomains") || "");
  const config = await getHeadScripts();

  await saveHeadScripts({
    ...config,
    allowedDomains: normalizeDomains(raw.split("\n")),
  });

  // The policy is emitted per request from this list, so nothing needs rebuilding
  // — but the admin page itself renders the current list.
  revalidatePath("/admin/scripts");
  redirect("/admin/scripts?domains=1");
}
