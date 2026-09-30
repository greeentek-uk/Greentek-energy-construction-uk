import AuthorForm from "../../../_components/AuthorForm";
import SaveBanner from "../../../_components/SaveBanner";
import { EditorHeader } from "../../../_components/editor/EditorLayout";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function NewAuthorPage({ searchParams }: Props) {
  const params = await searchParams;
  return (
    <div>
      <EditorHeader crumbs={[{ label: "Blog authors", href: "/admin/authors" }, { label: "New" }]} title="New author" />
      <SaveBanner error={params.error} />
      <AuthorForm />
    </div>
  );
}
