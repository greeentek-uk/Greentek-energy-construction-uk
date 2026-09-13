import Link from "next/link";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/db/pages";
import { getRevisions } from "@/lib/db/revisions";
import PageForm from "../../../_components/PageForm";
import SaveBanner from "../../../_components/SaveBanner";
import InternalLinkSuggestions from "../../../_components/InternalLinkSuggestions";
import RevisionList from "../../../_components/RevisionList";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}

export default async function EditPagePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const [sp, page] = await Promise.all([searchParams, getPageBySlug(slug)]);

  if (!page) notFound();

  const revisions = await getRevisions("pages", slug);

  return (
    <div>
      <Link href="/admin/pages" className="text-sm text-white/50 hover:text-white">
        ← All Pages
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">Edit: {page.title}</h1>

      <SaveBanner saved={sp.saved === "1"} error={sp.error} />

      <div className="space-y-4 mb-6">
        <InternalLinkSuggestions content={page.content} currentPath={`/${page.slug}`} />
        <RevisionList revisions={revisions} />
      </div>

      <PageForm page={page} />
    </div>
  );
}
