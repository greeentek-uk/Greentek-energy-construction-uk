"use client";

import { ArrowRight, MoveHorizontal } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

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

// Placeholder data — swap image paths for real before/after project photos.
// Copy is generic on purpose; add real specifics (locations, system sizes,
// savings figures) once confirmed.
type Project = {
  slug: string;
  category: string;
  title: string;
  description: string;
  before: string;
  after: string;
};

const projects: Project[] = [
  {
    slug: "solar-pv-installation",
    category: "Solar & Energy",
    title: "Solar PV Installation",
    description:
      "Rooftop solar system installed for a family home, cutting grid dependence and lowering monthly bills.",
    before: "/images/projects/Solar/before.png",
    after: "/images/projects/Solar/after.png",
  },
  {
    slug: "air-source-heat-pump-conversion",
    category: "Home Improvement",
    title: "Air Source Heat Pump Conversion",
    description:
      "Boiler-to-ASHP conversion delivering efficient, low-carbon heating for a semi-detached property.",
    before: "/images/projects/Heating/before.png",
    after: "/images/projects/Heating/after.webp",
  },
  {
    slug: "external-wall-insulation",
    category: "Home Improvement",
    title: "External Wall Insulation",
    description:
      "Full external wall insulation upgrade, reducing heat loss and modernising an older property's exterior.",
    before: "/images/projects/External Wall Insulation/before.jpeg",
    after: "/images/projects/External Wall Insulation/after.jpg",
  },
  {
    slug: "full-property-refurbishment",
    category: "Renovation",
    title: "Full Property Refurbishment",
    description:
      "Kitchen, bathroom, and extension refurbishment completed alongside an energy efficiency upgrade.",
    before: "/images/projects/Extension 2/before.jpeg",
    after: "/images/projects/Extension 2/after.jpeg",
  },
];

function BeforeAfterCard({
  project,
  delay,
}: {
  project: Project;
  delay: number;
}) {
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
      {/* Before/After slider image */}
      <div
        ref={containerRef}
        className="relative rounded-md overflow-hidden border-6 border-white w-full h-100 select-none touch-none cursor-ew-resize"
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
          className="absolute inset-0 w-full h-full object-cover bg-center pointer-events-none"
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
            className="h-full object-cover max-w-none"
            style={{ width: containerWidth || "100%" }}
          />
        </div>

        {/* Labels */}
        <span className="absolute top-3 left-3 bg-[#28282C] text-[#c5eb02] text-[10px] font-semibold uppercase px-2.5 py-1 rounded-full pointer-events-none">
          Before
        </span>
        <Link
          href={`/projects/${project.slug}`}
          aria-label={`View ${project.title} project`}
          className="absolute top-3 right-3 h-10 w-10 rounded-full bg-white flex items-center justify-center hover:bg-[#c5eb02] transition-colors"
        >
          <ArrowRight className="h-5 w-5 text-black" />
        </Link>

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

      {/* Text below image */}
      <Link href={`/projects/${project.slug}`} className="block pt-5 group">
        <p className="text-[10px] font-semibold uppercase  mb-3 bg-[#28282C] text-[#c5eb02] rounded-xl px-3 py-1 w-fit">
          {project.category}
        </p>
        <h3 className="text-xl md:text-2xl font-bold mb-2 text-white group-hover:text-[#c5eb02] transition-colors">
          {project.title}
        </h3>
        <p className="text-md font-normal text-white/80">
          {project.description}
        </p>
      </Link>
    </div>
  );
}

export default function Projects() {
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
            Drag the slider on each project to see the before and after, solar,
            home improvement, and renovation work, side by side.
          </p>
        </div>
      </div>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-12 max-w-7xl mx-auto mt-10 px-2">
        {projects.map((project, i) => (
          <BeforeAfterCard
            key={project.title}
            project={project}
            delay={i * 100}
          />
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
