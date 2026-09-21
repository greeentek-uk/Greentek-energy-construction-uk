import { Quote, Star } from "lucide-react";
import type { ProjectReview } from "@/data/site";
import { initialsFrom } from "@/lib/reviewSources";

/**
 * What the owner of this property said about this job.
 *
 * Deliberately a named review attached to one project rather than another
 * carousel of site-wide testimonials: on a case study the useful proof is the
 * person whose house is in the photographs above.
 */
export default function ProjectOwnerReview({
  review,
}: {
  review: ProjectReview | null | undefined;
}) {
  if (!review?.quote?.trim()) return null;

  const rating = Math.round(review.rating ?? 0);

  return (
    <section className="py-10 lg:py-16" aria-labelledby="owner-review-heading">
      <div className="site-container">
        <h2 id="owner-review-heading" className="sr-only">
          What the owner said
        </h2>
        <div className="rounded-xl bg-[#101314] p-3">
          <figure className="rounded-2xl bg-[#000000] px-6 py-8 md:px-10 md:py-10">
            <Quote className="h-8 w-8 text-[#c5eb02]" strokeWidth={1.75} aria-hidden />
            {rating > 0 && (
              <p className="mt-5 flex items-center gap-1" aria-label={`Rated ${rating} out of 5`}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    aria-hidden
                    className={`h-4 w-4 ${
                      n <= rating ? "fill-[#c5eb02] text-[#c5eb02]" : "text-white/20"
                    }`}
                  />
                ))}
              </p>
            )}
            <blockquote className="mt-4 site-prose text-lg font-medium leading-relaxed text-white md:text-2xl">
              {review.quote}
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/5 text-sm font-bold text-[#c5eb02]">
                {initialsFrom(review.name)}
              </span>
              <span>
                <span className="block font-semibold text-white">{review.name}</span>
                {review.role && (
                  <span className="block text-sm text-white/60">{review.role}</span>
                )}
              </span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
