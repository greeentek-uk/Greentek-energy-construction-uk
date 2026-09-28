"use server";

import { redirect } from "next/navigation";
import { setFocusKeyword } from "@/lib/db/focusKeywords";

/** Only back into the panel — the return address comes from the form. */
function safeReturn(value: string): string {
  return value.startsWith("/admin") && !value.startsWith("//") ? value : "/admin";
}

function withParam(url: string, param: string): string {
  const [base, hash] = url.split("#");
  return `${base}${base.includes("?") ? "&" : "?"}${param}${hash ? `#${hash}` : ""}`;
}

/**
 * Saves the panel-only focus keyword. No revalidation, deliberately: the
 * public site never reads it, so there is no page to refresh.
 */
export async function saveFocusKeywordAction(formData: FormData): Promise<void> {
  const path = String(formData.get("path") || "").trim();
  const keyword = String(formData.get("focusKeyword") || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 120);
  const back = safeReturn(String(formData.get("returnTo") || ""));

  if (!path.startsWith("/")) redirect(back);

  try {
    await setFocusKeyword(path, keyword);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    redirect(withParam(back, `error=${encodeURIComponent(message)}`));
  }
  redirect(withParam(back, "keywordSaved=1"));
}
