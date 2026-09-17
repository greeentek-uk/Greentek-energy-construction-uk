/**
 * Site-wide Cloudinary delivery settings.
 *
 * These drive `imageLoader.ts`, which Next calls synchronously wherever an
 * image renders — so the settings live in module state, set by
 * ImageDeliveryProvider in both the server render and the browser.
 */

export interface ImageDeliveryConfig {
  /** Cloudinary `q_` value: "auto", "auto:eco", "auto:good", "auto:best", or "40".."100". */
  quality: string;
  /** Adds `f_auto` so Cloudinary negotiates AVIF/WebP per browser. */
  autoFormat: boolean;
  /** Caps the widest variant Cloudinary is ever asked for, in px. */
  maxWidth: number;
  /** Adds `dpr_auto` — only useful when you've enabled Client Hints on the delivery domain. */
  dprAuto: boolean;
}

export const DEFAULT_IMAGE_DELIVERY: ImageDeliveryConfig = {
  quality: "auto",
  autoFormat: true,
  maxWidth: 2560,
  dprAuto: false,
};

export const QUALITY_OPTIONS = [
  { value: "auto", label: "Auto — Cloudinary picks (recommended)" },
  { value: "auto:eco", label: "Auto Eco — smaller files, slight quality loss" },
  { value: "auto:good", label: "Auto Good — balanced" },
  { value: "auto:best", label: "Auto Best — largest files, best quality" },
  { value: "90", label: "Fixed 90 — high" },
  { value: "80", label: "Fixed 80" },
  { value: "70", label: "Fixed 70" },
  { value: "60", label: "Fixed 60 — small" },
];

let currentConfig: ImageDeliveryConfig = DEFAULT_IMAGE_DELIVERY;

/**
 * Called by ImageDeliveryProvider during render, which runs in both the
 * server's client-component render and the browser — so both build identical
 * srcSets. Also called directly by server code that runs the loader itself,
 * such as the admin preview.
 */
export function setImageDeliveryConfig(config: ImageDeliveryConfig): void {
  currentConfig = config;
}

/** Sync read used by the image loader. Defaults until the provider has rendered. */
export function getImageDeliveryConfig(): ImageDeliveryConfig {
  return currentConfig;
}

export function normalizeImageDeliveryConfig(
  input: Partial<ImageDeliveryConfig> | null | undefined,
): ImageDeliveryConfig {
  if (!input) return DEFAULT_IMAGE_DELIVERY;
  const quality = QUALITY_OPTIONS.some((o) => o.value === input.quality)
    ? (input.quality as string)
    : DEFAULT_IMAGE_DELIVERY.quality;
  const maxWidth =
    typeof input.maxWidth === "number" && input.maxWidth >= 640 && input.maxWidth <= 5000
      ? Math.round(input.maxWidth)
      : DEFAULT_IMAGE_DELIVERY.maxWidth;

  return {
    quality,
    autoFormat: input.autoFormat ?? DEFAULT_IMAGE_DELIVERY.autoFormat,
    maxWidth,
    dprAuto: input.dprAuto ?? DEFAULT_IMAGE_DELIVERY.dprAuto,
  };
}
