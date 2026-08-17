"use client";

import { ArrowRight, MoveHorizontal } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Project } from "@/data/site";

function useFadeIn(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return { ref, visible };
}

function GalleryCard({ project, delay }: { project: Project; delay: number }) {
  const cardFade = useFadeIn(delay);
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
      ref={cardFade.ref}
      className={`transition-all duration-700 ease-out ${
        cardFade.visible
          ? "translate-y-0 opacity-100"
          : "translate-y-6 opacity-0"
      }`}
    >
      <div
        ref={containerRef}
        className="group relative aspect-[4/5] w-full select-none touch-none overflow-hidden rounded-xl  cursor-ew-resize max-h-[450px]"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* After image (base layer) */}
        <img
          src={project.after}
          alt={`${project.title} — after`}
          draggable={false}
          className="absolute inset-0 h-full w-full bg-center object-cover pointer-events-none"
        />

        {/* Before image (clipped to slider position) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ width: `${sliderPos}%` }}
        >
          <img
            src={project.before}
            alt={`${project.title} — before`}
            draggable={false}
            className="h-full max-w-none object-cover"
            style={{ width: containerWidth || "100%" }}
          />
        </div>

        {/* Labels */}
        <span className="absolute top-3 left-3 z-10 rounded-full bg-[#28282C] px-2.5 py-1 text-[10px] font-semibold uppercase text-[#c5eb02] pointer-events-none">
          Before
        </span>
        <Link
          href={`/projects/${project.slug}`}
          aria-label={`View ${project.title} project`}
          className="absolute top-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white transition-colors hover:bg-[#c5eb02]"
        >
          <ArrowRight className="h-5 w-5 text-black" />
        </Link>

        {/* Divider handle */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white pointer-events-none"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute top-1/2 left-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg">
            <MoveHorizontal className="h-4 w-4 text-black" />
          </div>
        </div>

        {/* Hover reveal: project text inside the image */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 translate-y-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-5 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
          <p className="mb-2 w-fit rounded-xl bg-[#28282C] px-2.5 py-1 text-[10px] font-semibold uppercase text-[#c5eb02]">
            {project.category}
          </p>
          <h3 className="text-lg font-bold text-white md:text-xl">
            {project.title}
          </h3>
          <p className="mt-1 text-sm font-normal text-white/85">
            {project.description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsClient({ projects }: { projects: Project[] }) {
  const headerFade = useFadeIn(0);

  return (
    <section className="py-12 md:py-16 lg:py-24 overflow-hidden px-4 md:px-10">
      <div className="mx-auto max-w-7xl px-6">
        <div
          ref={headerFade.ref}
          className={`text-center max-w-4xl mx-auto mb-10 md:mb-10 transition-all duration-700 ease-out ${
            headerFade.visible
              ? "translate-y-0 opacity-100"
              : "translate-y-6 opacity-0"
          }`}
        >
          <p className="text-[10px] md:text-[16px] font-semibold uppercase mb-6 bg-[#28282C] text-[#c5eb02] rounded-xl px-3 py-1 w-fit mx-auto">
            Our Work
          </p>
          <h2 className="text-[1.625rem] md:text-[2.5rem] font-bold leading-[1.2] text-white">
            See the Difference.
          </h2>
          <p className="mt-4 text-md md:text-xl text-white/80 leading-relaxed text-center w-[80%] md:w-[85%] mx-auto font-normal">
            Drag the slider to see the before and after, hover a project to read
            what was done, solar, home improvement, and renovation work, side by
            side.
          </p>
        </div>
      </div>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-7xl mx-auto mt-10 px-2">
        {projects.map((project, i) => (
          <GalleryCard key={project.slug} project={project} delay={i * 100} />
        ))}
      </div>
      <div className="mt-16 flex justify-center items-center">
        <a
          href="/projects"
          className="w-fit rounded px-4 py-3 text-sm md:text-[18px] font-semibold text-black backdrop-blur-sm transition active:scale-95 bg-[#c5eb02]"
        >
          View All Projects{" "}
          <ArrowRight className="inline ml-2 bg-black rounded px-1 py-1 text-white" />
        </a>
      </div>
    </section>
  );
}
