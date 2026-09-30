import Link from "next/link";
import { notFound } from "next/navigation";
import { getAuthorBySlug } from "@/lib/db/authors";
import { getBlogPosts } from "@/lib/db/blogPosts";
import { deleteAuthorAction } from "../../../_actions/authors";
import AuthorForm from "../../../_components/AuthorForm";
import SaveBanner from "../../../_components/SaveBanner";
import ConfirmSubmitButton from "../../../_components/ConfirmSubmitButton";
import { EditorHeader } from "../../../_components/editor/EditorLayout";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}

export default async function EditAuthorPage({ params, searchParams }: Props) {
  const [{ slug }, search] = await Promise.all([params, searchParams]);
  const [author, posts] = await Promise.all([getAuthorBySlug(slug), getBlogPosts()]);
  if (!author) notFound();
  const theirPosts = posts.filter((p) => p.authorSlug === slug);

  return (
    <div>
      <EditorHeader
        crumbs={[{ label: "Blog authors", href: "/admin/authors" }, { label: author.name }]}
        title={author.name}
        actions={
          <form action={deleteAuthorAction}>
            <input type="hidden" name="slug" value={author.slug} />
            <ConfirmSubmitButton
              message={`Delete ${author.name}? ${theirPosts.length ? `Their ${theirPosts.length} post(s) will show no author box until another author is picked.` : ""}`}
              className="text-xs font-semibold text-red-400 hover:text-red-300"
            >
              Delete
            </ConfirmSubmitButton>
          </form>
        }
      >
        <p className="mt-2 text-sm text-white/60">
          {theirPosts.length
            ? `Shown on ${theirPosts.length} post${theirPosts.length === 1 ? "" : "s"}: `
            : "Not on any post yet — pick this author in a post's Author field."}
          {theirPosts.map((p, i) => (
            <span key={p.slug}>
              {i > 0 && ", "}
              <Link href={`/admin/blog/${p.slug}`} className="underline hover:text-white">
                {p.title}
              </Link>
            </span>
          ))}
        </p>
      </EditorHeader>
      <SaveBanner saved={search.saved === "1"} error={search.error} />
      <AuthorForm author={author} />
    </div>
  );
}
