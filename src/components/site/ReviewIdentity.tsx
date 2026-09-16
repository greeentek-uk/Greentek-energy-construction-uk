import Image from "next/image";
import { getReviewSource, initialsFrom, avatarColor } from "@/lib/reviewSources";

/** Brand marks, drawn inline so the card costs no extra request. */
function SourceMark({ id, color }: { id: string; color: string }) {
  if (id === "google") {
    // Google's four-colour G, simplified to a single glyph at this size.
    return (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden>
        <path fill="#4285f4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9z" />
        <path fill="#34a853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24z" />
        <path fill="#fbbc05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.6V6.7H1.4a12 12 0 0 0 0 10.8l4-3.1z" />
        <path fill="#ea4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.7l4 3.1C6.3 6.9 8.9 4.8 12 4.8z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill={color} aria-hidden>
      <path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.7 1.2 6.6L12 17.7 6.1 20.8l1.2-6.6L2.5 9.5l6.6-.9L12 2.5z" />
    </svg>
  );
}

/**
 * A reviewer's avatar, name, role and where the review came from.
 *
 * Falls back to initials when there's no photo — reviews pulled from Google or
 * Trustpilot rarely have one, and an empty circle reads as a broken image.
 */
export default function ReviewIdentity({
  name,
  role,
  image,
  imageAlt,
  source,
}: {
  name: string;
  role?: string;
  image?: string;
  imageAlt?: string;
  source?: string;
}) {
  const reviewSource = getReviewSource(source);

  return (
    <div className="flex gap-4 py-2 md:py-4 items-center">
      {image ? (
        <Image
          src={image}
          alt={imageAlt || name}
          width={100}
          height={100}
          sizes="60px"
          className="w-15 h-15 rounded-full object-cover shrink-0"
        />
      ) : (
        <span
          aria-hidden
          className="w-15 h-15 shrink-0 rounded-full grid place-items-center text-lg font-bold text-white"
          style={{ backgroundColor: avatarColor(name) }}
        >
          {initialsFrom(name)}
        </span>
      )}

      <div className="min-w-0">
        <p className="text-2xl font-bold text-white truncate">{name}</p>
        {role && <p className="text-md text-white/70 truncate">{role}</p>}
        {reviewSource && (
          <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-white/60">
            <SourceMark id={reviewSource.id} color={reviewSource.color} />
            Review from {reviewSource.label}
          </p>
        )}
      </div>
    </div>
  );
}
