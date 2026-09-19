"use server";

import { redirect } from "next/navigation";
import { revalidateEverything } from "@/lib/revalidate";
import { getFooterCtaSettings, saveFooterCtaSettings } from "@/lib/db/footerCta";
import {
  normalizeOverridePath,
  type FooterCta,
  type FooterCtaButton,
  type FooterCtaLinkType,
} from "@/lib/footerCta";

function fail(message: string): never {
  redirect(`/admin/footer-cta?error=${encodeURIComponent(message)}`);
}

function readButton(formData: FormData, prefix: "primary" | "secondary"): FooterCtaButton {
  const type = String(formData.get(`${prefix}LinkType`) || "url");
  const linkType: FooterCtaLinkType =
    type === "whatsapp" || type === "call" ? type : "url";
  return {
    show: formData.get(`${prefix}Show`) === "on",
    label: String(formData.get(`${prefix}Label`) || "").trim(),
    linkType,
    href: String(formData.get(`${prefix}Href`) || "").trim(),
  };
}

function readCta(formData: FormData): FooterCta {
  const cta: FooterCta = {
    eyebrow: String(formData.get("eyebrow") || "").trim(),
    heading: String(formData.get("heading") || "").replace(/\r\n/g, "\n").trim(),
    body: String(formData.get("body") || "").trim(),
    primary: readButton(formData, "primary"),
    secondary: readButton(formData, "secondary"),
  };

  for (const [name, button] of [["First", cta.primary], ["Second", cta.secondary]] as const) {
    if (button.show && !button.label) fail(`${name} button is shown but has no text.`);
    if (button.show && button.linkType === "url" && !button.href) {
      fail(`${name} button links to a page or URL, but none was entered.`);
    }
  }
  return cta;
}

/**
 * Saves the site-wide default (`target` = "default") or one page override.
 * An override's path can be edited, so the original is posted alongside it.
 */
export async function saveFooterCtaAction(formData: FormData): Promise<void> {
  const target = String(formData.get("target") || "");
  const cta = readCta(formData);
  const settings = await getFooterCtaSettings();

  if (target === "default") {
    settings.default = cta;
  } else {
    const path = normalizeOverridePath(String(formData.get("path") || ""));
    if (!path) fail("Enter the page path, e.g. /finance or /services/*.");
    const clash = settings.overrides.find((o) => o.path === path && o.path !== target);
    if (clash) fail(`There's already a footer override for ${path}.`);

    const index = settings.overrides.findIndex((o) => o.path === target);
    if (index >= 0) settings.overrides[index] = { path, cta };
    else settings.overrides.push({ path, cta });
    settings.overrides.sort((a, b) => a.path.localeCompare(b.path));
  }

  try {
    await saveFooterCtaSettings(settings);
  } catch (err) {
    fail(err instanceof Error ? err.message : "Unknown error");
  }

  // The footer is on every page.
  await revalidateEverything();
  redirect("/admin/footer-cta?saved=1");
}

export async function deleteFooterCtaOverrideAction(formData: FormData): Promise<void> {
  const path = String(formData.get("path") || "");
  const settings = await getFooterCtaSettings();
  settings.overrides = settings.overrides.filter((o) => o.path !== path);

  try {
    await saveFooterCtaSettings(settings);
  } catch (err) {
    fail(err instanceof Error ? err.message : "Unknown error");
  }

  await revalidateEverything();
  redirect("/admin/footer-cta?deleted=1");
}
