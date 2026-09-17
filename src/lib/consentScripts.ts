import type { ConsentState } from "@/lib/consent";

/**
 * Turns the panel's consent-gated snippets into running scripts.
 *
 * HeadScripts renders those snippets as `type="text/plain"` placeholders, which
 * the browser never runs. Once the visitor allows a snippet's category, each
 * placeholder is copied into a real script. External scripts that weren't
 * `async` in the pasted snippet are waited on before the next one runs,
 * keeping the order the vendor's code relies on.
 */
const activated = new WeakSet<Element>();

function allowed(category: string | undefined, consent: ConsentState): boolean {
  return (
    (category === "analytics" && consent.analytics) ||
    (category === "marketing" && consent.marketing)
  );
}

export async function activateConsentedScripts(consent: ConsentState): Promise<void> {
  const placeholders = Array.from(
    document.querySelectorAll<HTMLScriptElement>('script[type="text/plain"][data-consent]'),
  );

  for (const placeholder of placeholders) {
    if (activated.has(placeholder) || !allowed(placeholder.dataset.consent, consent)) continue;
    activated.add(placeholder);

    const script = document.createElement("script");
    try {
      const attrs = JSON.parse(placeholder.dataset.attrs || "{}") as Record<string, string>;
      for (const [name, value] of Object.entries(attrs)) script.setAttribute(name, value);
    } catch {
      // Malformed attributes — run the script without them.
    }

    // Appended to the end of head/body rather than beside the placeholder, so
    // nothing is inserted between nodes React manages.
    const parent = placeholder.closest("head") ? document.head : document.body;
    const src = placeholder.dataset.src;

    if (!src) {
      script.text = placeholder.text;
      parent.appendChild(script);
      continue;
    }

    script.src = src;
    const isAsync = placeholder.dataset.async === "1";
    script.async = isAsync;
    if (isAsync) {
      parent.appendChild(script);
      continue;
    }

    await new Promise<void>((resolve) => {
      script.onload = () => resolve();
      script.onerror = () => resolve();
      parent.appendChild(script);
    });
  }
}
