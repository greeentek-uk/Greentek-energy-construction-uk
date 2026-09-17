// @vitest-environment jsdom
import { describe, expect, it, beforeEach } from "vitest";
import { activateConsentedScripts } from "@/lib/consentScripts";

function placeholder(attrs: Record<string, string>, code = "") {
  const s = document.createElement("script");
  s.type = "text/plain";
  for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v);
  s.text = code;
  document.head.appendChild(s);
  return s;
}

const realScripts = () =>
  [...document.querySelectorAll("script")].filter((s) => s.type !== "text/plain");

describe("activateConsentedScripts", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
    document.body.innerHTML = "";
  });

  it("runs only the categories that were allowed", async () => {
    placeholder({ "data-consent": "analytics" }, "window.a = 1");
    placeholder({ "data-consent": "marketing" }, "window.m = 1");
    await activateConsentedScripts({ analytics: true, marketing: false });
    const texts = realScripts().map((s) => s.text);
    expect(texts).toEqual(["window.a = 1"]);
  });

  it("never activates the same placeholder twice", async () => {
    placeholder({ "data-consent": "analytics" }, "window.__x = 1");
    await activateConsentedScripts({ analytics: true, marketing: false });
    await activateConsentedScripts({ analytics: true, marketing: true });
    expect(realScripts()).toHaveLength(1);
  });

  it("restores src, async and the original attributes", async () => {
    placeholder({
      "data-consent": "marketing",
      "data-src": "https://example.com/tag.js",
      "data-async": "1",
      "data-attrs": JSON.stringify({ id: "vendor", "data-key": "abc" }),
    });
    await activateConsentedScripts({ analytics: false, marketing: true });
    const [script] = realScripts();
    expect(script.src).toBe("https://example.com/tag.js");
    expect(script.async).toBe(true);
    expect(script.id).toBe("vendor");
    expect(script.getAttribute("data-key")).toBe("abc");
  });

  it("waits for a blocking external script before running the next one", async () => {
    placeholder({ "data-consent": "analytics", "data-src": "https://example.com/lib.js" });
    placeholder({ "data-consent": "analytics" }, "window.__lib = 1");
    const done = activateConsentedScripts({ analytics: true, marketing: false });
    await Promise.resolve();
    expect(realScripts().map((s) => s.src || s.text)).toEqual(["https://example.com/lib.js"]);
    realScripts()[0].dispatchEvent(new Event("load"));
    await done;
    expect(realScripts().map((s) => s.src || s.text)).toEqual(["https://example.com/lib.js", "window.__lib = 1"]);
  });

  it("ignores malformed stored attributes rather than failing", async () => {
    placeholder({ "data-consent": "analytics", "data-attrs": "{not json" }, "window.__ok = 1");
    await activateConsentedScripts({ analytics: true, marketing: false });
    expect(realScripts().map((s) => s.text)).toEqual(["window.__ok = 1"]);
  });
});
