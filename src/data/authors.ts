/**
 * A blog author, managed at Admin → Blog authors and picked on each post.
 *
 * Shown as the "About the author" box on a post and emitted as the post's
 * schema.org author (a Person, not just "Greentek") — named, credentialed
 * authorship is one of the signals search engines use to judge expertise.
 */
export interface Author {
  /** URL-safe id, derived from the name when the author is created. */
  slug: string;
  name: string;
  /** e.g. "Renewable Energy Surveyor at Greentek". */
  role: string;
  /** Sanitized inline HTML (bold, italic, links); paragraphs split on blank lines. */
  bio: string;
  photo?: string;
  photoAlt?: string;
  /** Optional profile page, e.g. LinkedIn — linked from the name and added to the schema. */
  profileUrl?: string;
}
