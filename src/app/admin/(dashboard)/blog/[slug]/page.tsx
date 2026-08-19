import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentBlogPosts } from "@/lib/cms";
import BlogForm from "../../../_components/BlogForm";
import SaveBanner from "../../../_components/SaveBanner";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}

export default async function EditBlogPostPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const posts = await getCurrentBlogPosts();
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <div>
      <Link href="/admin/blog" className="text-sm text-white/50 hover:text-white">
        ← All Posts
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">Edit: {post.title}</h1>

      <SaveBanner saved={sp.saved === "1"} error={sp.error} />

      <BlogForm post={post} />
    </div>
  );
}
