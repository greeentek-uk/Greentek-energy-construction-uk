import Link from "next/link";
import { ArrowRight } from "lucide-react";
import BeforeAfterSlider from "@/components/ui/BeforeAfterSlider";
import type { Project } from "@/data/site";

/**
 * A service page's lead project, told as a case study rather than a gallery
 * card: the result first (an interactive before/after the reader can drag),
 * then what was done and why it mattered, then the ask.
 *
 * The project is the one picked in the panel (Services → Case Study Project),
 * or else the service's own first project. There's deliberately no automatic
 * fallback to an unrelated job — a kitchen refit presented as the solar page's
 * case study would mislead — so a service with neither shows none.
 */
export default function ProjectCaseStudy({ project }: { project: Project }) {
  // The first two paragraphs carry the story; the project page has the rest.
  const story = (project.overview ?? []).slice(0, 2);

  return (
    <section className="py-10 lg:py-16">
      <div className="site-container">
        <div className="grid items-center gap-6 rounded-xl bg-[#101314] p-3 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <BeforeAfterSlider
              before={project.before}
              after={project.after}
              title={project.title}
              beforeAlt={project.beforeAlt}
              afterAlt={project.afterAlt}
              labels={{ before: "Before Greentek", after: "After Greentek" }}
              sizes="(min-width: 1024px) 720px, 100vw"
              className="h-80 md:h-[28rem]"
            />
            <p className="mt-3 text-center text-xs font-medium text-white/50">
              Drag the slider to compare
            </p>
          </div>

          <div className="px-3 pb-5 lg:col-span-5 lg:px-2 lg:py-6">
            <p className="mb-5 w-fit rounded-2xl bg-[#28282C] px-3 py-1 text-[10px] font-semibold uppercase text-[#c5eb02] md:text-[14px]">
              Case study
            </p>
            <h2 className="text-[1.625rem] font-bold leading-[1.2] text-white md:text-[2.25rem]">
              {project.title}
            </h2>
            <p className="mt-4 text-lg font-medium leading-relaxed text-white/85">
              {project.description}
            </p>
            {story.map((paragraph, i) => (
              <p key={i} className="mt-3 text-base leading-relaxed text-white/70">
                {paragraph}
              </p>
            ))}

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {/* #quote is the full enquiry form further down this page. */}
              <Link
                href="#quote"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#c5eb02] px-6 py-3.5 text-sm font-bold text-black transition-all hover:bg-[#c5eb02]/80"
              >
                I want results like this
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={`/projects/${project.slug}`}
                className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3.5 text-sm font-bold text-white transition-all hover:border-[#c5eb02] hover:text-[#c5eb02]"
              >
                See the full project
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
