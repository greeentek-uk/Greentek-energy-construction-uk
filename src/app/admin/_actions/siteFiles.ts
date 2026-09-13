"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { saveRobotsConfig, saveLlmsConfig } from "@/lib/db/siteFiles";
import { normalizeRobotsConfig, type RobotsConfig } from "@/lib/robotsConfig";
import { normalizeLlmsConfig, type LlmsConfig } from "@/lib/llmsConfig";

function fail(message: string): never {
  redirect(`/admin/site-files?error=${encodeURIComponent(message)}`);
}

function parseConfig<T>(formData: FormData): Partial<T> {
  try {
    const parsed = JSON.parse(String(formData.get("config") || "{}"));
    if (typeof parsed !== "object" || parsed === null) throw new Error("Malformed payload");
    return parsed as Partial<T>;
  } catch (err) {
    fail(err instanceof Error ? err.message : "Malformed payload");
  }
}

export async function saveRobotsAction(formData: FormData): Promise<void> {
  const config = normalizeRobotsConfig(parseConfig<RobotsConfig>(formData));

  if (config.mode === "raw" && !config.raw.trim()) {
    fail("robots.txt can't be saved empty — switch to the rule builder or type the file.");
  }

  try {
    await saveRobotsConfig(config);
  } catch (err) {
    fail(err instanceof Error ? err.message : "Unknown error");
  }

  revalidatePath("/robots.txt");
  redirect("/admin/site-files?saved=robots");
}

export async function saveLlmsAction(formData: FormData): Promise<void> {
  const config = normalizeLlmsConfig(parseConfig<LlmsConfig>(formData));

  if (config.enabled && config.mode === "raw" && !config.raw.trim()) {
    fail("llms.txt can't be saved empty — switch to building it from site content.");
  }

  try {
    await saveLlmsConfig(config);
  } catch (err) {
    fail(err instanceof Error ? err.message : "Unknown error");
  }

  revalidatePath("/llms.txt");
  redirect("/admin/site-files?saved=llms");
}
