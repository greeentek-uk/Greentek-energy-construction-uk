import { getImageDeliveryConfig } from "./imageDelivery";

interface LoaderArgs {
  src: string;
  width: number;
  quality?: number;
}

const CLOUDINARY_UPLOAD_MARKER = "/image/upload/";

function isCloudinary(src: string): boolean {
  return src.includes("res.cloudinary.com") && src.includes(CLOUDINARY_UPLOAD_MARKER);
}

/**
 * Cloudinary already stores the originals, so let it do the resizing and
 * format negotiation instead of paying to re-optimize each one through Next's
 * optimizer. Anything not on Cloudinary (the local `/images/*` logos and
 * icons) still goes through the built-in optimizer.
 *
 * Wired up via `images.loaderFile` in next.config.ts, so it runs for every
 * `<Image>` on the site without touching a single call site.
 */
export default function cloudinaryLoader({ src, width, quality }: LoaderArgs): string {
  if (!isCloudinary(src)) {
    return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`;
  }

  const config = getImageDeliveryConfig();
  const [base, rest] = src.split(CLOUDINARY_UPLOAD_MARKER);

  // A URL may already carry transformations — a deliberate crop pasted in by
  // hand, say. Those are kept as their own component and ours are *chained*
  // after them (Cloudinary applies `t1/t2/` in order) rather than merged in.
  // Merging would mean dropping some of the admin's parameters and keeping
  // others, which silently changes what the crop was meant to do.
  const segments = rest.split("/");
  const hasExistingTransform =
    segments.length > 1 && segments[0].includes("_") && !/^v\d+$/.test(segments[0]);
  const existing = hasExistingTransform ? segments.shift()! : null;

  const targetWidth = Math.min(width, config.maxWidth);
  const ours = [
    ...(config.autoFormat ? ["f_auto"] : []),
    `q_${quality ? String(quality) : config.quality}`,
    `w_${targetWidth}`,
    // c_limit never upscales past the source, so a small original stays sharp
    // and an admin's narrower crop above is not blown back up.
    "c_limit",
    ...(config.dprAuto ? ["dpr_auto"] : []),
  ].join(",");

  const transformPath = existing ? `${existing}/${ours}` : ours;

  return `${base}${CLOUDINARY_UPLOAD_MARKER}${transformPath}/${segments.join("/")}`;
}
