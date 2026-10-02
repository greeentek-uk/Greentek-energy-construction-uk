import Image from "next/image";

/**
 * An image in a fixed-shape frame (the blog cards are 4:5, the post's own
 * image 16:9) that is never cropped. An image of the frame's shape fills it
 * edge to edge; any other shape is shown whole over a blurred, cover-cropped
 * copy of itself, so nothing is letterboxed in flat black either.
 *
 * This replaced plain `object-cover`: a post with no landscape image falls
 * back to its portrait card image, and cover-cropping that to 16:9 kept only
 * the middle ~45% of its height — text on the graphic was cut off.
 *
 * The backdrop asks the loader for a tiny width (`sizes="48px"`), so it costs
 * a few KB, and is hidden from assistive tech. The parent must be
 * `position: relative` with the frame's aspect ratio and `overflow: hidden`.
 */
export default function FittedImage({
  src,
  alt,
  sizes,
  priority,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
}) {
  return (
    <>
      <Image
        src={src}
        alt=""
        aria-hidden="true"
        fill
        sizes="48px"
        className="scale-110 object-cover object-center blur-xl"
      />
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-contain object-center" />
    </>
  );
}
