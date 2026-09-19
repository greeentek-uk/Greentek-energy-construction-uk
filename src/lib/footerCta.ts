import { whatsappUrl } from "@/lib/whatsapp";

/**
 * The call to action at the top of the footer, editable site-wide and per page.
 *
 * Kept free of React and the database so the resolution rules can be tested
 * directly — see tests/unit/footerCta.test.ts.
 */

export type FooterCtaLinkType = "url" | "whatsapp" | "call";

export interface FooterCtaButton {
  show: boolean;
  label: string;
  /**
   * "whatsapp" and "call" are built from the company phone number, so a
   * button can't drift from the number shown everywhere else.
   */
  linkType: FooterCtaLinkType;
  /** Used when linkType is "url": a path like /contact, or a full URL. */
  href: string;
}

export interface FooterCta {
  eyebrow: string;
  /** A line break in the panel becomes a line break on the page. */
  heading: string;
  body: string;
  /** The lime button. */
  primary: FooterCtaButton;
  /** The white button. */
  secondary: FooterCtaButton;
}

export interface FooterCtaOverride {
  /** Exact path ("/finance") or a prefix wildcard ("/services/*"). */
  path: string;
  cta: FooterCta;
}

export interface FooterCtaSettings {
  default: FooterCta;
  overrides: FooterCtaOverride[];
}

/** Exactly what the footer showed before it was editable. */
export const DEFAULT_FOOTER_CTA: FooterCta = {
  eyebrow: "Get In Touch",
  heading: "Ready to Switch to Solar\nand Save for Years?",
  body: "Join thousands of happy customers who are already enjoying clean energy and significant savings. Get your free consultation today.",
  primary: { show: true, label: "Consult an Expert", linkType: "whatsapp", href: "" },
  secondary: { show: true, label: "Get a Free Quote", linkType: "url", href: "/contact" },
};

export const DEFAULT_FOOTER_CTA_SETTINGS: FooterCtaSettings = {
  default: DEFAULT_FOOTER_CTA,
  overrides: [],
};

function matches(pattern: string, path: string): boolean {
  if (pattern.endsWith("/*")) return path.startsWith(pattern.slice(0, -1));
  return pattern === path;
}

/**
 * The CTA for a page: an exact-path override first, then the most specific
 * wildcard ("/locations/cardiff/*" beats "/locations/*"), then the default.
 */
export function resolveFooterCta(path: string, settings: FooterCtaSettings): FooterCta {
  const clean = path.length > 1 ? path.replace(/\/+$/, "") : path;

  const exact = settings.overrides.find((o) => o.path === clean);
  if (exact) return exact.cta;

  const wildcard = settings.overrides
    .filter((o) => o.path.endsWith("/*") && matches(o.path, clean))
    .sort((a, b) => b.path.length - a.path.length)[0];
  return wildcard ? wildcard.cta : settings.default;
}

export interface ResolvedLink {
  href: string;
  external: boolean;
}

export function footerCtaHref(button: FooterCtaButton, phone: string): ResolvedLink {
  if (button.linkType === "whatsapp") return { href: whatsappUrl(phone), external: true };
  if (button.linkType === "call") {
    return { href: `tel:${phone.replace(/[^\d+]/g, "")}`, external: false };
  }
  const href = button.href.trim() || "/contact";
  return { href, external: /^https?:\/\//i.test(href) };
}

/**
 * Tidies a path typed in the panel: leading slash, no trailing slash, and only
 * a trailing "/*" allowed as a wildcard. Null when it can't be a site path.
 */
export function normalizeOverridePath(input: string): string | null {
  let path = input.trim();
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) {
    try {
      path = new URL(path).pathname;
    } catch {
      return null;
    }
  }
  if (!path.startsWith("/")) path = `/${path}`;
  const wildcard = path.endsWith("/*");
  const base = (wildcard ? path.slice(0, -2) : path).replace(/\/+$/, "");
  if (base.includes("*") || base.startsWith("/admin")) return null;
  if (wildcard) return `${base || ""}/*`;
  return base || "/";
}

function normalizeButton(input: Partial<FooterCtaButton> | undefined, fallback: FooterCtaButton): FooterCtaButton {
  const linkType: FooterCtaLinkType =
    input?.linkType === "whatsapp" || input?.linkType === "call" || input?.linkType === "url"
      ? input.linkType
      : fallback.linkType;
  return {
    show: input?.show ?? fallback.show,
    label: typeof input?.label === "string" ? input.label : fallback.label,
    linkType,
    href: typeof input?.href === "string" ? input.href : fallback.href,
  };
}

export function normalizeFooterCta(input: Partial<FooterCta> | undefined, fallback = DEFAULT_FOOTER_CTA): FooterCta {
  return {
    eyebrow: typeof input?.eyebrow === "string" ? input.eyebrow : fallback.eyebrow,
    heading: typeof input?.heading === "string" ? input.heading : fallback.heading,
    body: typeof input?.body === "string" ? input.body : fallback.body,
    primary: normalizeButton(input?.primary, fallback.primary),
    secondary: normalizeButton(input?.secondary, fallback.secondary),
  };
}

export function normalizeFooterCtaSettings(
  input: Partial<FooterCtaSettings> | null | undefined,
): FooterCtaSettings {
  if (!input) return DEFAULT_FOOTER_CTA_SETTINGS;
  return {
    default: normalizeFooterCta(input.default),
    overrides: Array.isArray(input.overrides)
      ? input.overrides
          .filter((o) => o && typeof o.path === "string")
          .map((o) => ({ path: o.path, cta: normalizeFooterCta(o.cta) }))
      : [],
  };
}
