/** Where a script tag is injected into the document. */
export type ScriptPlacement = "head" | "body-start" | "body-end";

export type ScriptConsent = "necessary" | "analytics" | "marketing";

export const SCRIPT_CONSENTS: ScriptConsent[] = ["necessary", "analytics", "marketing"];

export function scriptConsentOf(entry: Pick<ScriptEntry, "consent">): ScriptConsent {
  return entry.consent && SCRIPT_CONSENTS.includes(entry.consent) ? entry.consent : "analytics";
}

export interface ScriptTag {
  /** External script: the `src` URL. Mutually exclusive with `code`. */
  src?: string;
  /** Inline script body, or the inner HTML of a `<noscript>`. */
  code?: string;
  async?: boolean;
  defer?: boolean;
  /** `<noscript>` fallback markup (GTM ships one) rather than a `<script>`. */
  noscript?: boolean;
  /** Passed straight through to the rendered tag: id, type, data-*, crossorigin… */
  attributes?: Record<string, string>;
}

export interface ScriptEntry {
  id: string;
  /** Admin-facing label, e.g. "Google Tag Manager". */
  name: string;
  enabled: boolean;
  placement: ScriptPlacement;
  /**
   * Which cookie consent the snippet waits for. Analytics and marketing
   * snippets don't run until the visitor accepts that category; necessary ones
   * run for everyone. Missing (entries saved before consent existed) is treated
   * as analytics — the safe side for a tracker nobody has categorised.
   */
  consent?: ScriptConsent;
  /** One pasted snippet can expand to several tags (GTM = a script + a noscript). */
  tags: ScriptTag[];
  /** The original pasted markup, kept so the admin can re-read and re-edit it. */
  raw: string;
  updatedAt: string;
}

export interface HeadScriptsConfig {
  entries: ScriptEntry[];
  /**
   * Extra origins added to the CSP's script-src/connect-src/img-src/frame-src.
   * Tag managers load further scripts at runtime from hosts that never appear
   * in the pasted snippet, so this can't be fully derived — the admin lists them.
   */
  allowedDomains: string[];
}

export const EMPTY_HEAD_SCRIPTS: HeadScriptsConfig = { entries: [], allowedDomains: [] };

const SCRIPT_RE = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
const NOSCRIPT_RE = /<noscript\b([^>]*)>([\s\S]*?)<\/noscript\s*>/gi;
const ATTR_RE = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;

function parseAttributes(raw: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const match of raw.matchAll(ATTR_RE)) {
    const name = match[1].toLowerCase();
    attrs[name] = match[2] ?? match[3] ?? match[4] ?? "";
  }
  return attrs;
}

/**
 * Turns a pasted vendor snippet (GTM, GA4, Meta Pixel, Hotjar…) into structured
 * tags we can render as real React elements.
 *
 * This has to be structured rather than a raw HTML dump: a `<script>` injected
 * through `dangerouslySetInnerHTML` is inert — the browser parses it but never
 * executes it — so the tag has to exist as an actual element in the tree.
 *
 * Bare JavaScript with no surrounding tag is accepted too and treated as one
 * inline script, since that's what half the vendor docs hand you.
 */
export function parseSnippet(raw: string): ScriptTag[] {
  const tags: ScriptTag[] = [];
  const trimmed = raw.trim();
  if (!trimmed) return tags;

  for (const match of trimmed.matchAll(SCRIPT_RE)) {
    const attrs = parseAttributes(match[1]);
    // async/defer are read from the attribute map below rather than spread onto
    // the tag as strings, so they're destructured out of `rest` here.
    const { src, async, defer, ...rest } = attrs;
    const code = match[2].trim();
    tags.push({
      ...(src ? { src } : {}),
      ...(code ? { code } : {}),
      async: "async" in attrs,
      defer: "defer" in attrs,
      ...(Object.keys(rest).length ? { attributes: rest } : {}),
    });
  }

  for (const match of trimmed.matchAll(NOSCRIPT_RE)) {
    tags.push({ noscript: true, code: match[2].trim() });
  }

  // No tags at all means they pasted plain JS — wrap it as one inline script.
  if (tags.length === 0 && !trimmed.startsWith("<")) {
    tags.push({ code: trimmed });
  }

  return tags;
}

/** Origins the snippets themselves reference, used to pre-fill and sanity-check the allowlist. */
export function extractOrigins(entries: ScriptEntry[]): string[] {
  const origins = new Set<string>();
  for (const entry of entries) {
    for (const tag of entry.tags) {
      const candidates = [tag.src, ...(tag.code ? extractUrlsFromCode(tag.code) : [])];
      for (const candidate of candidates) {
        if (!candidate) continue;
        try {
          origins.add(new URL(candidate, "https://example.invalid").origin);
        } catch {
          // Not a resolvable URL — nothing to allowlist.
        }
      }
    }
  }
  origins.delete("https://example.invalid");
  return [...origins].sort();
}

function extractUrlsFromCode(code: string): string[] {
  return [...code.matchAll(/https?:\/\/[^\s"'`)]+/g)].map((m) => m[0]);
}

/** A hostname `URL` would accept but a CSP would not, e.g. "!!bad". */
const HOSTNAME_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;

/**
 * Keeps only well-formed origins, so a typo can't widen the CSP unexpectedly.
 *
 * `new URL()` alone isn't enough — it accepts "https://!!bad" — so the host is
 * checked separately. A leading `*.` wildcard is allowed: CSP supports it, and
 * vendors like Microsoft Clarity serve from several subdomains that can't all
 * be listed one by one. A bare `*` or a wildcard on a single-label host is not.
 */
export function normalizeDomains(lines: string[]): string[] {
  const out = new Set<string>();
  for (const line of lines) {
    const value = line.trim();
    if (!value) continue;
    // A full URL pasted from a vendor snippet is trimmed to its origin — the
    // path and query have no meaning in a CSP host source.
    const match = value.match(/^(https?:\/\/)?(\*\.)?([^/:?#]+)(:\d+)?(?:[/?#].*)?$/i);
    if (!match) continue;
    const [, scheme = "https://", wildcard = "", host, port = ""] = match;
    if (!HOSTNAME_RE.test(host)) continue;
    out.add(`${scheme.toLowerCase()}${wildcard}${host.toLowerCase()}${port}`);
  }
  return [...out].sort();
}
