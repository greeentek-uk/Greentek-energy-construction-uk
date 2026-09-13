"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { updateSettings } from "@/lib/db/settings";

interface OpeningHoursRow {
  days: string;
  opens: string;
  closes: string;
  closed?: boolean;
}

export async function saveLocalSeoAction(formData: FormData): Promise<void> {
  const str = (key: string) => String(formData.get(key) || "").trim();

  // Posted as parallel arrays, one value per row, so they line up by index.
  const days = formData.getAll("hours_days").map((v) => String(v).trim());
  const opens = formData.getAll("hours_opens").map((v) => String(v).trim());
  const closes = formData.getAll("hours_closes").map((v) => String(v).trim());
  const closed = formData.getAll("hours_closed").map((v) => String(v) === "on");

  const openingHours: OpeningHoursRow[] = days
    .map((day, index) => ({
      days: day,
      opens: opens[index] ?? "",
      closes: closes[index] ?? "",
      closed: closed[index] ?? false,
    }))
    .filter((row) => row.days);

  try {
    await updateSettings({
      localSeo: {
        businessType: str("businessType"),
        priceRange: str("priceRange"),
        latitude: str("latitude"),
        longitude: str("longitude"),
        serviceArea: str("serviceArea"),
        openingHours,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    redirect(`/admin/local-seo?error=${encodeURIComponent(message)}`);
  }

  // The LocalBusiness block is rendered in the root layout on every page.
  revalidatePath("/", "layout");
  redirect("/admin/local-seo?saved=1");
}
