"use client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { siteConfig } from "@/data/site";
import BeforeAfterSlider from "@/components/ui/BeforeAfterSlider";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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

type Project = {
  slug: string;
  category: string;
  title: string;
  description: string;
  before: string;
  after: string;
};

function ProjectCard({ project, delay }: { project: Project; delay: number }) {
  const cardFade = useFadeIn(delay);

  return (
    <div
      ref={cardFade.ref}
      className={`transition-all duration-700 ease-out ${
        cardFade.visible
          ? "translate-y-0 opacity-100"
          : "translate-y-6 opacity-0"
      }`}
    >
      <BeforeAfterSlider
        before={project.before}
        after={project.after}
        title={project.title}
      />

      {/* Text below image */}
      <div className="pt-5">
        <p className="text-[10px] font-semibold uppercase mb-3 bg-[#28282C] text-[#c5eb02] rounded-xl px-3 py-1 w-fit">
          {project.category}
        </p>
        <Link href={`/projects/${project.slug}`} className="group">
          <h3 className="text-xl md:text-2xl font-bold mb-2 text-white group-hover:text-[#c5eb02] transition-colors">
            {project.title}
          </h3>
        </Link>
        <p className="text-md font-normal text-white/80">
          {project.description}
        </p>
        <Link
          href={`/projects/${project.slug}`}
          className="inline-block mt-4 text-[#c5eb02] font-bold text-sm hover:text-[#c5eb02]/80"
        >
          View Project →
        </Link>
      </div>
    </div>
  );
}

export default function ProjectsPageClient() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 ">
        {/* Projects Header - Centered */}
        <section className="relative bg-[url('/images/footer/footer-bg.webp')] bg-cover overflow-hidden">
          <div className="bg-black/70 pt-30 py-20">
            <h1 className="text-[2rem] md:text-[3.5rem] font-bold leading-[1.15] text-white mx-auto text-center">
              Our <span className="text-[#C5EB02]">Project Gallery</span>
            </h1>
            <p className="mt-6 text-md md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed font-medium text-center w-[85%]">
              Explore our track record of excellence across the UK, featuring
              high-impact renewable energy installations and premium
              construction projects.
            </p>
          </div>
        </section>

        <section className="py-12 lg:py-24 ">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {siteConfig.projects.map((project, index) => (
                <ProjectCard
                  key={project.slug}
                  project={project}
                  delay={index * 100}
                />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
