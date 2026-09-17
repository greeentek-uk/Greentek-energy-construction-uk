import { describe, expect, it } from "vitest";
import { extractOrigins, normalizeDomains, parseSnippet, scriptConsentOf, type ScriptEntry } from "@/lib/headScripts";

const GA4 = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-TEST123"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-TEST123');
</script>`;

describe("parseSnippet", () => {
  it("splits a vendor snippet into real tags", () => {
    const tags = parseSnippet(GA4);
    expect(tags).toHaveLength(2);
    expect(tags[0]).toMatchObject({ src: "https://www.googletagmanager.com/gtag/js?id=G-TEST123", async: true, defer: false });
    expect(tags[1].code).toContain("gtag('config', 'G-TEST123')");
  });

  it("keeps noscript fallbacks and custom attributes", () => {
    const tags = parseSnippet(`<script id="x" data-site="1" defer src="https://a.test/t.js"></script><noscript><iframe src="https://a.test/ns"></iframe></noscript>`);
    expect(tags[0]).toMatchObject({ defer: true, attributes: { id: "x", "data-site": "1" } });
    expect(tags[1]).toMatchObject({ noscript: true });
  });

  it("wraps bare JavaScript as one inline script", () => {
    expect(parseSnippet("console.log('hi')")).toEqual([{ code: "console.log('hi')" }]);
  });

  it("returns nothing for empty or tagless markup", () => {
    expect(parseSnippet("   ")).toEqual([]);
    expect(parseSnippet("<div>nope</div>")).toEqual([]);
  });
});

describe("normalizeDomains", () => {
  it("keeps valid origins, wildcards and trims URLs to their origin", () => {
    expect(
      normalizeDomains([
        "https://*.clarity.ms",
        "https://connect.facebook.net/en_US/fbevents.js",
        "googletagmanager.com",
        "HTTPS://WWW.Google-Analytics.com",
        "http://localhost.test:8080/x",
      ]),
    ).toEqual([
      "http://localhost.test:8080",
      "https://*.clarity.ms",
      "https://connect.facebook.net",
      "https://googletagmanager.com",
      "https://www.google-analytics.com",
    ]);
  });

  it("drops anything that would widen the policy dangerously", () => {
    expect(normalizeDomains(["*", "*.com", "!!bad", "javascript:alert(1)", "https://*.*.evil.com", "ftp://x.com", ""])).toEqual([]);
  });

  it("de-duplicates", () => {
    expect(normalizeDomains(["https://a.test", "a.test", "https://a.test/path"])).toEqual(["https://a.test"]);
  });
});

describe("extractOrigins", () => {
  it("finds origins in src and inline code", () => {
    const entry = { tags: parseSnippet(GA4 + `<script>fetch("https://api.vendor.test/x")</script>`) } as ScriptEntry;
    expect(extractOrigins([entry])).toEqual(["https://api.vendor.test", "https://www.googletagmanager.com"]);
  });
});

describe("scriptConsentOf", () => {
  it("treats uncategorised snippets as analytics — the safe default", () => {
    expect(scriptConsentOf({})).toBe("analytics");
    expect(scriptConsentOf({ consent: "bogus" as never })).toBe("analytics");
    expect(scriptConsentOf({ consent: "necessary" })).toBe("necessary");
    expect(scriptConsentOf({ consent: "marketing" })).toBe("marketing");
  });
});
