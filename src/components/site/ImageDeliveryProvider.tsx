"use client";

import { setImageDeliveryConfig, type ImageDeliveryConfig } from "@/lib/imageDelivery";

/**
 * Hands the admin's image delivery settings to the image loader.
 *
 * The loader is synchronous and runs wherever `next/image` renders — in the
 * server's client-component render and again in the browser. Those are
 * separate module copies from the server components that fetch the settings,
 * so setting it from the root layout never reached the loader during SSR: the
 * server built image URLs from defaults, the browser from the saved values, and
 * every image failed hydration.
 *
 * Rendering this above the page means it runs first in both environments,
 * before any image beneath it computes its srcSet. The value is site-wide and
 * identical for every request, so updating the shared module state is safe.
 */
export default function ImageDeliveryProvider({
  config,
  children,
}: {
  config: ImageDeliveryConfig;
  children: React.ReactNode;
}) {
  setImageDeliveryConfig(config);
  return <>{children}</>;
}
