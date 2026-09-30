import Link from "next/link";
import { getAuthors } from "@/lib/db/authors";
import { getBlogPosts } from "@/lib/db/blogPosts";
import SaveBanner from "../../_components/SaveBanner";

interface Props {
  searchParams: Promise<{ deleted?: string; error?: string }>;
}

export default async function AuthorsAdminPage({ searchParams }: Props) {
  const [params, authors, posts] = await Promise.all([searchParams, getAuthors(), getBlogPosts()]);
  const postCount = (slug: string) => posts.filter((p) => p.authorSlug === slug).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold">Blog authors</h1>
        <Link
          href="/admin/authors/new"
          className="rounded-lg bg-[#c5eb02] text-black text-sm font-semibold px-4 py-2 hover:bg-[#c5eb02]/80"
        >
          + New Author
        </Link>
      </div>
      <p className="text-white/50 mb-6 text-sm">
        Pick an author on a blog post and their &quot;About the author&quot; box appears at the end of
        it. Editing an author here updates every post they wrote.
      </p>

      <SaveBanner saved={params.deleted === "1"} error={params.error} />

      <ul className="bg-[#101314] border border-white/10 rounded-xl divide-y divide-white/10">
        {authors.map((a) => (
          <li key={a.slug}>
            <Link href={`/admin/authors/${a.slug}`} className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-white/5">
              <span className="min-w-0">
                <span className="block font-semibold text-white">{a.name}</span>
                <span className="block text-xs text-white/40 truncate">{a.role || "No role set"}</span>
              </span>
              <span className="shrink-0 text-xs text-white/50">
                {postCount(a.slug)} post{postCount(a.slug) === 1 ? "" : "s"}
              </span>
            </Link>
          </li>
        ))}
        {authors.length === 0 && (
          <li className="px-5 py-4 text-sm text-white/40">No authors yet — add one, then pick them on a post.</li>
        )}
      </ul>
    </div>
  );
}
