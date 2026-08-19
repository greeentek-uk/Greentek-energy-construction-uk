import Link from "next/link";
import { getCurrentBlogPosts } from "@/lib/cms";
import { deleteBlogPostAction } from "../../_actions/blog";
import SaveBanner from "../../_components/SaveBanner";
import ConfirmSubmitButton from "../../_components/ConfirmSubmitButton";

interface Props {
  searchParams: Promise<{ deleted?: string; error?: string }>;
}

export default async function BlogListPage({ searchParams }: Props) {
  const params = await searchParams;
  const posts = await getCurrentBlogPosts();

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <Link
          href="/admin/blog/new"
          className="rounded-lg bg-[#c5eb02] text-black text-sm font-semibold px-4 py-2 hover:bg-[#c5eb02]/80"
        >
          + New Post
        </Link>
      </div>
      <p className="text-white/50 mb-6 text-sm">
        {posts.length} post{posts.length === 1 ? "" : "s"}
      </p>

      <SaveBanner
        saved={params.deleted === "1"}
        error={params.error}
      />
      {params.deleted === "1" && (
        <p className="-mt-4 mb-6 text-sm text-white/50">Post deleted.</p>
      )}

      <div className="bg-[#101314] border border-white/10 rounded-xl divide-y divide-white/10">
        {posts.map((post) => (
          <div
            key={post.slug}
            className="flex items-center justify-between gap-4 px-4 py-3"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {post.title}
              </p>
              <p className="text-xs text-white/40 truncate">
                /blog/{post.slug} · {post.date} · {post.category}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href={`/admin/blog/${post.slug}`}
                className="text-sm font-semibold text-white hover:underline"
              >
                Edit
              </Link>
              <form action={deleteBlogPostAction}>
                <input type="hidden" name="slug" value={post.slug} />
                <ConfirmSubmitButton
                  message={`Delete "${post.title}"? This cannot be undone.`}
                  className="text-sm font-semibold text-red-400 hover:text-red-300"
                >
                  Delete
                </ConfirmSubmitButton>
              </form>
            </div>
          </div>
        ))}
        {posts.length === 0 && (
          <p className="px-4 py-6 text-sm text-white/40">No posts yet.</p>
        )}
      </div>
    </div>
  );
}
