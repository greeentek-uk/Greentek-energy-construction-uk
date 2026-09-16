/**
 * Review rating badge: label, star strip, Trustpilot logo, in that order.
 *
 * Hand-built rather than Trustpilot's TrustBox widget, because TrustBox is a
 * paid feature — their API returns "BusinessUnit does not have access to that
 * trustbox" for this account and serves a bare logo with no rating. This shows
 * the real numbers instead, and costs nothing.
 *
 * The trade-off is that the figures don't update themselves, so they're
 * editable in the admin panel and the whole badge links to the live profile.
 */
const TRUSTPILOT_GREEN = "#00b67a";

function StarStrip({ score }: { score: number }) {
  return (
    <span className="flex items-center gap-[2px]" aria-hidden>
      {[0, 1, 2, 3, 4].map((index) => {
        // Each box fills left-to-right, so a 4.4 leaves the fifth box 40% green.
        // Rounded to one decimal — float subtraction otherwise emits widths
        // like "40.000000000000036%" into the markup.
        const fill = Math.round(Math.max(0, Math.min(1, score - index)) * 1000) / 10;
        return (
          <span
            key={index}
            className="relative block h-[18px] w-[18px] overflow-hidden rounded-[2px]"
            style={{ backgroundColor: "#dcdce6" }}
          >
            <span
              className="absolute inset-y-0 left-0"
              style={{ width: `${fill}%`, backgroundColor: TRUSTPILOT_GREEN }}
            />
            <svg
              viewBox="0 0 24 24"
              className="absolute inset-0 h-full w-full p-[2px]"
              fill="#fff"
            >
              <path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.7 1.2 6.6L12 17.7 6.1 20.8l1.2-6.6L2.5 9.5l6.6-.9L12 2.5z" />
            </svg>
          </span>
        );
      })}
    </span>
  );
}

export default function TrustRatingBadge({
  label,
  score,
  url,
  className = "",
}: {
  label: string;
  score: string;
  url?: string;
  className?: string;
}) {
  if (!label && !score) return null;

  const numericScore = Number.parseFloat(score) || 0;

  const content = (
    <>
      {label && <span className="font-bold text-black">{label}</span>}
      <StarStrip score={numericScore} />
      <span className="inline-flex items-center gap-1 font-bold text-black">
        <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill={TRUSTPILOT_GREEN} aria-hidden>
          <path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.7 1.2 6.6L12 17.7 6.1 20.8l1.2-6.6L2.5 9.5l6.6-.9L12 2.5z" />
        </svg>
        Trustpilot
      </span>
    </>
  );

  const shared = `inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm ${className}`;
  const readable = `${label} ${numericScore} out of 5 on Trustpilot`;

  if (!url) {
    return (
      <div className={shared} aria-label={readable}>
        {content}
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${readable} — read the reviews`}
      className={`${shared} transition-opacity hover:opacity-90`}
    >
      {content}
    </a>
  );
}
