"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { saveMenus, type MenuItem, type Menus } from "@/lib/db/menus";

function parseMenu(formData: FormData, key: string): MenuItem[] {
  try {
    const parsed = JSON.parse(String(formData.get(key) || "[]"));
    if (!Array.isArray(parsed)) return [];
    return (parsed as MenuItem[])
      .map((item) => ({
        id: String(item.id || ""),
        label: String(item.label || "").trim(),
        href: String(item.href || "").trim(),
        ...(item.newTab ? { newTab: true } : {}),
        ...(item.children?.length
          ? {
              children: item.children
                .map((child) => ({
                  id: String(child.id || ""),
                  label: String(child.label || "").trim(),
                  href: String(child.href || "").trim(),
                  ...(child.newTab ? { newTab: true } : {}),
                }))
                .filter((child) => child.label && child.href),
            }
          : {}),
      }))
      .filter((item) => item.label && item.href);
  } catch {
    return [];
  }
}

export async function saveMenusAction(formData: FormData): Promise<void> {
  const menus: Menus = {
    header: parseMenu(formData, "header"),
    footer: parseMenu(formData, "footer"),
  };

  if (menus.header.length === 0) {
    redirect(
      `/admin/menus?error=${encodeURIComponent(
        "The header menu can't be empty — visitors would have no way to navigate.",
      )}`,
    );
  }

  try {
    await saveMenus(menus);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    redirect(`/admin/menus?error=${encodeURIComponent(message)}`);
  }

  // Header and Footer render on every page.
  revalidatePath("/", "layout");
  redirect("/admin/menus?saved=1");
}
