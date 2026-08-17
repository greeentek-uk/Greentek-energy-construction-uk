import type { Metadata } from "next";
import { getCurrentSeoOverrides } from "@/lib/cms";

export type SeoOverride = { title?: string; description?: string };
export type SeoOverrides = Record<string, SeoOverride>;

/** Looks up an admin-set title/description override for a route path, e.g. "/services/solar-pv-installations". */
export async function getSeoOverride(path: string): Promise<SeoOverride | undefined> {
  const overrides = await getCurrentSeoOverrides();
  return overrides[path];
}

/**
 * Builds page metadata, applying an admin override on top of computed
 * defaults. The default title is plain text so the root layout's
 * `%s | Greentek Construction` template can suffix it; an override is
 * treated as the exact, final title the admin wants (via `title.absolute`)
 * so it isn't suffixed a second time.
 */
export async function withSeoOverride(
  path: string,
  defaults: { title: string; description: string },
): Promise<Metadata> {
  const override = await getSeoOverride(path);
  return {
    title: override?.title ? { absolute: override.title } : defaults.title,
    description: override?.description || defaults.description,
    alternates: { canonical: path },
  };
}
