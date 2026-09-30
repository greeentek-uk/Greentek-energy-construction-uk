"use client";

export interface PoolReview {
  key: string;
  name: string;
  role: string;
  quote: string;
}

/**
 * Which of the shared reviews this page shows. Reviews are real customers'
 * words, so pages pick from the one list (Shared sections → Testimonials)
 * rather than writing their own. The testimonials section used to show the
 * same reviews on every service and location page.
 *
 * Pre-ticked with what the page shows today. The save keeps a selection that
 * differs from the inherited one as this page's own (as with the other
 * inherited sections); ticking none means "follow" — the section can't be empty.
 */
export default function ReviewPicker({
  pool,
  own,
  inherited,
  inheritedFrom = "every review",
}: {
  pool: PoolReview[];
  own?: string[];
  /** What the page shows when it has no selection of its own; unset = all. */
  inherited?: string[];
  inheritedFrom?: string;
}) {
  if (!pool.length) return null;
  const allKeys = pool.map((r) => r.key);
  const following = inherited?.length ? inherited : allKeys;
  const checked = new Set(own?.length ? own : following);

  return (
    <div className="space-y-3">
      <input type="hidden" name="reviews_present" value="1" />
      <input type="hidden" name="reviews_inherited" value={JSON.stringify(following)} />
      <p
        className={`rounded-lg px-3 py-2 text-xs font-semibold ${
          own?.length ? "bg-green-500/10 text-green-400" : "bg-white/5 text-white/60"
        }`}
      >
        {own?.length
          ? "This page has its own choice of reviews."
          : `Showing ${inheritedFrom}. Change the ticks and Save — this page then keeps its own choice.`}
      </p>
      {Boolean(own?.length) && (
        <label className="flex items-center gap-2 text-xs text-white/70">
          <input type="checkbox" name="resetReviews" className="accent-[#c5eb02]" />
          Go back to {inheritedFrom} (discards this page&apos;s choice on Save)
        </label>
      )}
      <p className="text-xs font-semibold text-white/70">Reviews shown on this page</p>
      <ul className="space-y-2">
        {pool.map((review) => (
          <li key={review.key}>
            <label className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
              <input
                type="checkbox"
                name="review"
                value={review.key}
                defaultChecked={checked.has(review.key)}
                className="mt-1 accent-[#c5eb02]"
              />
              <span className="min-w-0">
                <span className="font-semibold text-white">{review.name}</span>
                {review.role && <span className="text-white/40"> · {review.role}</span>}
                <span className="block text-white/60 line-clamp-2">&ldquo;{review.quote}&rdquo;</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
      <p className="text-xs text-white/40">
        Add or edit the reviews themselves in Shared sections → Testimonials.
      </p>
    </div>
  );
}
