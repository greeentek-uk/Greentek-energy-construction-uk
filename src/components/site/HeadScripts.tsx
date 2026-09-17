import {
  scriptConsentOf,
  type ScriptConsent,
  type ScriptEntry,
  type ScriptPlacement,
  type ScriptTag,
} from "@/lib/headScripts";

/** HTML attribute names React expects in camelCase (or under a different name entirely). */
const REACT_ATTRIBUTE_NAMES: Record<string, string> = {
  class: "className",
  for: "htmlFor",
  crossorigin: "crossOrigin",
  referrerpolicy: "referrerPolicy",
  nomodule: "noModule",
  charset: "charSet",
};

function toReactProps(attributes: Record<string, string> = {}): Record<string, string | boolean> {
  const props: Record<string, string | boolean> = {};
  for (const [name, value] of Object.entries(attributes)) {
    // data-* and aria-* are passed through verbatim; React only renames the known HTML ones.
    const key = name.startsWith("data-") || name.startsWith("aria-")
      ? name
      : REACT_ATTRIBUTE_NAMES[name] ?? name;
    props[key] = value === "" ? true : value;
  }
  return props;
}

/**
 * A snippet waiting for consent is rendered inert — `type="text/plain"` is
 * never executed — with everything needed to run it later kept in data
 * attributes. activateConsentedScripts() turns it into a real script once the
 * visitor accepts that category.
 */
function renderGatedTag(tag: ScriptTag, key: string, consent: ScriptConsent) {
  // A <noscript> fallback only renders with JavaScript off, when no one can
  // give consent, so a gated one is dropped entirely.
  if (tag.noscript) return null;

  return (
    <script
      key={key}
      type="text/plain"
      data-consent={consent}
      {...(tag.src ? { "data-src": tag.src } : {})}
      {...(tag.async ? { "data-async": "1" } : {})}
      {...(tag.attributes ? { "data-attrs": JSON.stringify(tag.attributes) } : {})}
      dangerouslySetInnerHTML={{ __html: tag.code ?? "" }}
    />
  );
}

function renderTag(tag: ScriptTag, key: string) {
  if (tag.noscript) {
    return <noscript key={key} dangerouslySetInnerHTML={{ __html: tag.code ?? "" }} />;
  }

  const props = toReactProps(tag.attributes);

  if (tag.src) {
    return (
      // Whether a vendor tag blocks is the vendor's call, not ours — consent
      // managers in particular have to run before anything else renders — so
      // async/defer are taken from the pasted snippet rather than forced on.
      // eslint-disable-next-line @next/next/no-sync-scripts
      <script
        key={key}
        src={tag.src}
        {...(tag.async ? { async: true } : {})}
        {...(tag.defer ? { defer: true } : {})}
        {...props}
      />
    );
  }

  // Inline code has to be rendered as a real <script> element — markup injected
  // as an HTML string is parsed but never executed by the browser.
  return <script key={key} {...props} dangerouslySetInnerHTML={{ __html: tag.code ?? "" }} />;
}

/**
 * Renders the admin's tracking/marketing snippets for one placement.
 *
 * Anything these scripts load must also be allowlisted in the CSP — that list
 * lives alongside the snippets in the admin panel and is applied in proxy.ts.
 */
export default function HeadScripts({
  entries,
  placement,
}: {
  entries: ScriptEntry[];
  placement: ScriptPlacement;
}) {
  const active = entries.filter((e) => e.enabled && e.placement === placement);
  if (!active.length) return null;

  return (
    <>
      {active.flatMap((entry) => {
        const consent = scriptConsentOf(entry);
        return entry.tags.map((tag, index) =>
          consent === "necessary"
            ? renderTag(tag, `${entry.id}-${index}`)
            : renderGatedTag(tag, `${entry.id}-${index}`, consent),
        );
      })}
    </>
  );
}
