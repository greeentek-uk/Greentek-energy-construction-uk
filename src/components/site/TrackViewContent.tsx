"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";

/** Fires ViewContent once when a service page is shown. Renders nothing. */
export default function TrackViewContent({
  name,
  category,
  id,
}: {
  name: string;
  category: string;
  id: string;
}) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    track("ViewContent", {
      content_name: name,
      content_category: category,
      content_ids: [id],
      content_type: "service",
    });
  }, [name, category, id]);

  return null;
}
