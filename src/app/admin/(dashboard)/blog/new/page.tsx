import Link from "next/link";
import BlogForm from "../../../_components/BlogForm";
import SaveBanner from "../../../_components/SaveBanner";
import { getAuthors } from "@/lib/db/authors";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function NewBlogPostPage({ searchParams }: Props) {
  const [params, authors] = await Promise.all([searchParams, getAuthors()]);

  return (
    <div>
      <Link href="/admin/blog" className="text-sm text-white/50 hover:text-white">
        ← All Posts
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">New Blog Post</h1>

      <SaveBanner error={params.error} />

      <BlogForm authors={authors} />
    </div>
  );
}
