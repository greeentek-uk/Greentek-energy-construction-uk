"use client";

import { ArrowRight, MoveHorizontal } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface BeforeAfterSliderProps {
  before: string;
  after: string;
  title: string;
  className?: string;
}

export default function BeforeAfterSlider({
  before,
  after,
  title,
  className = "h-100",
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [containerWidth, setContainerWidth] = useState(0);
  const draggingRef = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const updatePosFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.min(100, Math.max(0, pct)));
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    (e.target as Element).setPointerCapture(e.pointerId);
    updatePosFromClientX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    updatePosFromClientX(e.clientX);
  };

  const handlePointerUp = () => {
    draggingRef.current = false;
  };

  return (
    <div
      ref={containerRef}
      className={`relative rounded-xl overflow-hidden border-8 border-white w-full select-none touch-none cursor-ew-resize ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* After image (base layer) */}
      <img
        src={after}
        alt={`${title} — after`}
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover bg-center pointer-events-none"
      />

      {/* Before image (clipped to slider position) */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ width: `${sliderPos}%` }}
      >
        <img
          src={before}
          alt={`${title} — before`}
          draggable={false}
          className="h-full object-cover max-w-none"
          style={{ width: containerWidth || "100%" }}
        />
      </div>

      {/* Labels */}
      <span className="absolute top-3 left-3 bg-[#28282C] text-[#c5eb02] text-[10px] font-semibold uppercase px-2.5 py-1 rounded-full pointer-events-none">
        Before
      </span>
      <span className="absolute top-3 right-3 h-10 w-10 rounded-full bg-white flex items-center justify-center pointer-events-none">
        <ArrowRight className="h-5 w-5 text-black" />
      </span>

      {/* Divider handle */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white pointer-events-none"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center">
          <MoveHorizontal className="h-4 w-4 text-black" />
        </div>
      </div>
    </div>
  );
}
