"use client";

import { useEffect, useRef } from "react";

/**
 * Reports a 404 hit to the admin panel's monitor.
 *
 * Renders nothing. Fires once per mount — the ref guards against React's
 * development double-invoke turning every miss into two logged hits.
 */
export default function NotFoundLogger() {
  const reported = useRef(false);

  useEffect(() => {
    if (reported.current) return;
    reported.current = true;

    fetch("/api/not-found", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: window.location.pathname,
        referrer: document.referrer || null,
      }),
      keepalive: true,
    }).catch(() => {
      // The visitor already has their 404; a failed log is not their problem.
    });
  }, []);

  return null;
}
