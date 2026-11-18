"use client";

import { useEffect } from "react";

/**
 * On a landing page with the grant quiz, every quote button (`[data-quote]`:
 * header, sticky phone bar, each section's call to action) scrolls to the quiz
 * instead of opening the pop-up form. One form on the page, not two: the
 * pop-up asked the same questions as dropdowns, so a visitor could meet two
 * different forms for the same thing (2026-11-04 full-page review).
 *
 * The buttons still link to `#quote` (the closing section's quiz) without JS.
 */
export default function ScrollToQuiz({ target }: { target: string }) {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const trigger = (event.target as Element | null)?.closest?.("[data-quote]");
      const quiz = document.getElementById(target);
      if (!trigger || !quiz) return;
      event.preventDefault();
      quiz.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [target]);

  return null;
}
