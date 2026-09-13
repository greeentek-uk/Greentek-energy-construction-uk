import { getCurrentSiteConfig, getCurrentBlogPosts } from "@/lib/cms";
import { suggestInternalLinks, type LinkTarget } from "@/lib/internalLinks";
import type { ContentBlock } from "@/data/content";

/**
 * Shows where the copy mentions something that has its own page.
 *
 * Read-only on purpose — it points out the opportunity and leaves the wording
 * to a person, rather than rewriting their paragraphs behind their back.
 */
export default async function InternalLinkSuggestions({
  content,
  currentPath,
}: {
  content: ContentBlock[] | undefined;
  currentPath?: string;
}) {
  const [site, posts] = await Promise.all([getCurrentSiteConfig(), getCurrentBlogPosts()]);

  const targets: LinkTarget[] = [
    ...site.services.flatMap((service) => [
      {
        phrase: service.title,
        href: `/services/${service.slug}`,
        label: service.title,
        kind: "Service" as const,
      },
      {
        phrase: service.shortName,
        href: `/services/${service.slug}`,
        label: service.title,
        kind: "Service" as const,
      },
    ]),
    ...site.locations.map((location) => ({
      phrase: location.name,
      href: `/locations/${location.slug}`,
      label: location.name,
      kind: "Location" as const,
    })),
    ...posts.map((post) => ({
      phrase: post.title,
      href: `/blog/${post.slug}`,
      label: post.title,
      kind: "Blog post" as const,
    })),
  ];

  const suggestions = suggestInternalLinks(content, targets, currentPath);

  if (suggestions.length === 0) return null;

  return (
    <details className="border border-white/10 rounded-lg bg-white/5">
      <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-white hover:bg-white/5">
        Internal link suggestions ({suggestions.length})
      </summary>
      <div className="px-4 pb-4 space-y-3">
        <p className="text-xs text-white/40">
          This copy mentions pages you already have. Linking them helps readers and spreads
          ranking strength — add a link in the text above where it reads naturally.
        </p>
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.href}
            className="border border-white/10 rounded-lg px-3 py-2 bg-black/30"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase text-white/40 bg-white/5 px-1.5 py-0.5 rounded-full">
                {suggestion.kind}
              </span>
              <code className="text-xs text-[#c5eb02]">{suggestion.href}</code>
            </div>
            <p className="text-xs text-white/50">
              &ldquo;…{suggestion.context}…&rdquo;
            </p>
          </div>
        ))}
      </div>
    </details>
  );
}
