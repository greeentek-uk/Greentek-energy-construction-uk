"use client";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * The subset of OpenWidget's loader API used here (it's LiveChat's widget
 * API: `call` for commands, `on` for events). Checked against
 * cdn.openwidget.com/openwidget.js on 2026-10-22.
 */
interface OpenWidgetApi {
  call: (method: "minimize" | "hide" | "hide_greeting") => void;
  on: (event: string, handler: (payload: unknown) => void) => void;
  off: (event: string, handler: (payload: unknown) => void) => void;
}
declare global {
  interface Window {
    OpenWidget?: OpenWidgetApi;
  }
}

/** Ad landing pages have their own sticky Call / Free quote bar in the same corner. */
const isLandingPath = (path: string) => path === "/lp" || path.startsWith("/lp/");

/** How long a greeting may cover a phone screen before it's tucked away. */
const PHONE_GREETING_MS = 6000;

/**
 * Phone behaviour (owner, 2026-10-22: "it never closes on itself"):
 * - a greeting bubble goes after a few seconds, or as soon as the visitor
 *   scrolls — it was sitting over the page until dismissed by hand;
 * - coming back to the tab (e.g. from WhatsApp, opened from the widget)
 *   finds the chat minimised rather than still filling the screen.
 * Desktop is untouched: there the widget is a corner panel, not the page.
 */
function usePhoneTidying(enabled: boolean) {
  useEffect(() => {
    if (!enabled || !window.matchMedia("(max-width: 767px)").matches) return;
    let greetingTimer: number | undefined;
    let greetingOpen = false;
    let maximized = false;
    const api = () => window.OpenWidget;

    const hideGreeting = () => {
      window.clearTimeout(greetingTimer);
      if (greetingOpen) api()?.call("hide_greeting");
      greetingOpen = false;
    };
    const onGreeting = () => {
      greetingOpen = true;
      window.clearTimeout(greetingTimer);
      greetingTimer = window.setTimeout(hideGreeting, PHONE_GREETING_MS);
    };
    const onGreetingHidden = () => {
      greetingOpen = false;
    };
    const onVisibility = (payload: unknown) => {
      maximized = (payload as { visibility?: string } | null)?.visibility === "maximized";
    };
    const onReturn = () => {
      if (document.visibilityState === "visible" && maximized) api()?.call("minimize");
    };

    // window.OpenWidget is created by the inline <Script> below, which can run
    // after this effect; once it exists, the loader queues on() calls until
    // the real widget arrives. Give up after ~15s (blocked by an ad blocker).
    let tries = 0;
    const attach = () => {
      const ow = api();
      if (!ow) {
        if (++tries < 60) waitTimer = window.setTimeout(attach, 250);
        return;
      }
      ow.on("greeting_displayed", onGreeting);
      ow.on("greeting_hidden", onGreetingHidden);
      ow.on("visibility_changed", onVisibility);
    };
    let waitTimer: number | undefined;
    attach();
    window.addEventListener("scroll", hideGreeting, { passive: true });
    document.addEventListener("visibilitychange", onReturn);
    return () => {
      window.clearTimeout(waitTimer);
      window.clearTimeout(greetingTimer);
      api()?.off("greeting_displayed", onGreeting);
      api()?.off("greeting_hidden", onGreetingHidden);
      api()?.off("visibility_changed", onVisibility);
      window.removeEventListener("scroll", hideGreeting);
      document.removeEventListener("visibilitychange", onReturn);
    };
  }, [enabled]);
}

export default function OpenWidget() {
  const pathname = usePathname() ?? "";
  const onLanding = isLandingPath(pathname);

  // Not loaded at all when the visit starts on a landing page. If it was
  // loaded elsewhere first, it's hidden there and comes back (minimised) after.
  // Only on a change of page: on first load the dashboard's settings decide.
  const wasLanding = useRef(onLanding);
  useEffect(() => {
    if (wasLanding.current === onLanding) return;
    wasLanding.current = onLanding;
    window.OpenWidget?.call(onLanding ? "hide" : "minimize");
  }, [onLanding]);

  usePhoneTidying(!onLanding);

  if (onLanding) return null;
  return (
    <>
      <Script id="openwidget" strategy="afterInteractive">
        {`
          window.__ow = window.__ow || {};
          window.__ow.organizationId = "e5f04de6-c5c1-434a-a36d-e260143881d8";
          window.__ow.integration_name = "manual_settings";
          window.__ow.product_name = "openwidget";
          ;(function(n,t,c){function i(n){return e._h?e._h.apply(null,n):e._q.push(n)}var e={_q:[],_h:null,_v:"2.0",on:function(){i(["on",c.call(arguments)])},once:function(){i(["once",c.call(arguments)])},off:function(){i(["off",c.call(arguments)])},get:function(){if(!e._h)throw new Error("[OpenWidget] You can't use getters before load.");return i(["get",c.call(arguments)])},call:function(){i(["call",c.call(arguments)])},init:function(){var n=t.createElement("script");n.async=!0,n.type="text/javascript",n.src="https://cdn.openwidget.com/openwidget.js",t.head.appendChild(n)}};!n.__ow.asyncInit&&e.init(),n.OpenWidget=n.OpenWidget||e}(window,document,[].slice))
        `}
      </Script>
      <noscript>
        You need to{" "}
        <a
          href="https://www.openwidget.com/enable-javascript"
          rel="noopener nofollow"
        >
          enable JavaScript
        </a>{" "}
        to use the communication tool powered by{" "}
        <a
          href="https://www.openwidget.com/"
          rel="noopener nofollow"
          target="_blank"
        >
          OpenWidget
        </a>
        .
      </noscript>
    </>
  );
}
