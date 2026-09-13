/**
 * Site-wide Cloudinary delivery settings.
 *
 * These drive `imageLoader.ts`, which Next calls synchronously on both the
 * server and the client — so the config has to be readable without awaiting.
 * The root layout reads the admin-saved values from Mongo once per render and
 * pushes them in here (server) and onto `window` (client, via an inline script
 * emitted before any markup that hydrates), keeping both sides in lockstep so
 * the generated srcSet matches and React doesn't warn about a mismatch.
 *
 * The values are site-wide rather than per-request, so a module-level cache is
 * safe across concurrent renders.
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

const GLOBAL_KEY = "__GREENTEK_IMAGE_DELIVERY__";

let serverConfig: ImageDeliveryConfig = DEFAULT_IMAGE_DELIVERY;

/** Called by the root layout with the admin-saved values. */
export function setImageDeliveryConfig(config: ImageDeliveryConfig): void {
  serverConfig = config;
}

/** Sync read used by the image loader. Falls back to defaults before the layout has run. */
export function getImageDeliveryConfig(): ImageDeliveryConfig {
  if (typeof window !== "undefined") {
    const fromWindow = (window as unknown as Record<string, unknown>)[GLOBAL_KEY];
    if (fromWindow) return fromWindow as ImageDeliveryConfig;
    return DEFAULT_IMAGE_DELIVERY;
  }
  return serverConfig;
}

/** The inline `<script>` body the layout emits so the client loader sees the same values the server used. */
export function imageDeliveryBootstrapScript(config: ImageDeliveryConfig): string {
  return `window.${GLOBAL_KEY}=${JSON.stringify(config)}`;
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
