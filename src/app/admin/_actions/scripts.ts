"use server";

import { redirect } from "next/navigation";
import { revalidate } from "@/lib/revalidate";
import { getHeadScripts, saveHeadScripts } from "@/lib/db/headScripts";
import { saveMetaPixelSettings } from "@/lib/db/metaPixel";
import { saveClaritySettings } from "@/lib/db/clarity";
import { saveGoogleAnalyticsSettings } from "@/lib/db/googleAnalytics";
import {
  normalizeDomains,
  parseSnippet,
  SCRIPT_CONSENTS,
  type ScriptConsent,
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
  const consent = String(formData.get("consent") || "analytics") as ScriptConsent;

  if (!name) fail("Give the script a name so you can recognise it later.");
  if (!raw) fail("Paste the snippet before saving.");
  if (!PLACEMENTS.includes(placement)) fail("Unknown placement.");
  if (!SCRIPT_CONSENTS.includes(consent)) fail("Unknown cookie category.");

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
    consent,
    tags,
    raw,
    updatedAt: new Date().toISOString(),
  };

  const entries = id
    ? config.entries.map((e) => (e.id === id ? entry : e))
    : [...config.entries, entry];

  await saveHeadScripts({ ...config, entries });

  await revalidate("/", "layout");
  redirect("/admin/scripts?saved=1");
}

export async function toggleScriptAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") || "");
  const config = await getHeadScripts();

  await saveHeadScripts({
    ...config,
    entries: config.entries.map((e) => (e.id === id ? { ...e, enabled: !e.enabled } : e)),
  });

  await revalidate("/", "layout");
  redirect("/admin/scripts?saved=1");
}

export async function deleteScriptAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") || "");
  const config = await getHeadScripts();

  await saveHeadScripts({
    ...config,
    entries: config.entries.filter((e) => e.id !== id),
  });

  await revalidate("/", "layout");
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
  await revalidate("/admin/scripts");
  redirect("/admin/scripts?domains=1");
}

export async function saveMetaPixelAction(formData: FormData): Promise<void> {
  const pixelId = String(formData.get("pixelId") || "").trim();
  const testEventCode = String(formData.get("testEventCode") || "").trim();

  if (pixelId && !/^\d{10,20}$/.test(pixelId)) {
    fail("A Meta Pixel ID is a long number — copy it from Events Manager → Data sources.");
  }

  const consent = formData.get("consent") === "marketing" ? "marketing" : "necessary";

  await saveMetaPixelSettings({ pixelId, testEventCode, consent });

  // The pixel id is rendered into every page.
  await revalidate("/", "layout");
  redirect("/admin/scripts?saved=1");
}

export async function saveClarityAction(formData: FormData): Promise<void> {
  const projectId = String(formData.get("clarityProjectId") || "").trim();

  if (projectId && !/^[a-z0-9]{6,20}$/i.test(projectId)) {
    fail("A Clarity project ID is a short code like yjfzqaq5fv — copy it from Clarity → Settings → Overview.");
  }

  await saveClaritySettings({ projectId });
  await revalidate("/", "layout");
  redirect("/admin/scripts?saved=1");
}

export async function saveGoogleAnalyticsAction(formData: FormData): Promise<void> {
  const measurementId = String(formData.get("measurementId") || "").trim().toUpperCase();

  if (measurementId && !/^G-[A-Z0-9]{4,20}$/.test(measurementId)) {
    fail("A GA4 measurement ID looks like G-WMBE8DEKZ7 — copy it from Admin → Data streams.");
  }

  await saveGoogleAnalyticsSettings({ measurementId });
  await revalidate("/", "layout");
  redirect("/admin/scripts?saved=1");
}
