"use client";

import { useEffect, useState } from "react";

/**
 * Reveals an element the first time it scrolls into view.
 *
 * Returns `[ref, visible]`: put `ref` on the element and switch its classes on
 * `visible`. The ref is a callback ref, so the observer attaches whenever the
 * element mounts — including elements that appear after the first render.
 *
 * This replaced sixteen private copies of the same hook, one per section.
 */
export function useFadeIn<T extends Element = HTMLDivElement>(
  delay = 0,
  threshold = 0.1,
): [(node: T | null) => void, boolean] {
  const [node, setNode] = useState<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!node || visible) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        timer = setTimeout(() => setVisible(true), delay);
      },
      { threshold },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [node, delay, threshold, visible]);

  return [setNode, visible];
}
