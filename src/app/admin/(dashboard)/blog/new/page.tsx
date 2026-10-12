import Link from "next/link";
import BlogForm from "../../../_components/BlogForm";
import SaveBanner from "../../../_components/SaveBanner";
import { getAuthors } from "@/lib/db/authors";
import { getCurrentBlogPosts } from "@/lib/cms";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function NewBlogPostPage({ searchParams }: Props) {
  const [params, authors, posts] = await Promise.all([
    searchParams,
    getAuthors(),
    getCurrentBlogPosts(),
  ]);

  return (
    <div>
      <Link href="/admin/blog" className="text-sm text-white/50 hover:text-white">
        ← All Posts
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">New Blog Post</h1>

      <SaveBanner error={params.error} />

      <BlogForm
        authors={authors}
        allPosts={posts.map((p) => ({ slug: p.slug, title: p.title, category: p.category }))}
      />
    </div>
  );
}
