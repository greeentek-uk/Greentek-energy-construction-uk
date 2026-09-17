"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  clearTrackingCookies,
  readConsent,
  writeConsent,
  type ConsentState,
} from "@/lib/consent";
import CookieBanner from "@/components/site/CookieBanner";

interface ConsentContextValue {
  /** Null until the visitor has chosen (or before the cookie has been read). */
  consent: ConsentState | null;
  save: (next: ConsentState) => void;
  openSettings: () => void;
}

const ConsentContext = createContext<ConsentContextValue>({
  consent: null,
  save: () => {},
  openSettings: () => {},
});

export function useConsent(): ConsentContextValue {
  return useContext(ConsentContext);
}

/**
 * Holds the visitor's cookie choice and shows the banner until they make one.
 *
 * The layout is statically rendered, so the cookie can only be read here in the
 * browser; the banner therefore appears just after the page loads. It's fixed
 * to the bottom of the screen, so it never moves page content.
 */
export default function ConsentProvider({
  showMarketing,
  metaNecessary,
  children,
}: {
  /** Whether anything on the site waits for marketing consent. */
  showMarketing: boolean;
  /** Whether the Meta Pixel runs as a necessary tracker, for the banner's wording. */
  metaNecessary: boolean;
  children: React.ReactNode;
}) {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    // Reading a cookie is a sync with the browser, which can only happen after
    // hydration — the server render has no visitor to read it from.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConsent(readConsent());
    setLoaded(true);
  }, []);

  const save = useCallback(
    (next: ConsentState) => {
      const withdrawn =
        (consent?.analytics && !next.analytics) || (consent?.marketing && !next.marketing);
      writeConsent(next);
      setSettingsOpen(false);

      if (withdrawn) {
        // Scripts that already ran can't be unloaded, so their cookies are
        // cleared and the page reloaded without them.
        clearTrackingCookies();
        window.location.reload();
        return;
      }
      setConsent(next);
    },
    [consent],
  );

  const openSettings = useCallback(() => setSettingsOpen(true), []);
  const value = useMemo(() => ({ consent, save, openSettings }), [consent, save, openSettings]);

  return (
    <ConsentContext.Provider value={value}>
      {children}
      {loaded && (consent === null || settingsOpen) && (
        <CookieBanner
          initial={consent}
          startInSettings={settingsOpen}
          showMarketing={showMarketing}
          metaNecessary={metaNecessary}
          onSave={save}
          onClose={consent ? () => setSettingsOpen(false) : undefined}
        />
      )}
    </ConsentContext.Provider>
  );
}
