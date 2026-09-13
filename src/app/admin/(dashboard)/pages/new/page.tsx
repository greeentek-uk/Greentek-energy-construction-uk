import Link from "next/link";
import PageForm from "../../../_components/PageForm";
import SaveBanner from "../../../_components/SaveBanner";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function NewPagePage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <div>
      <Link href="/admin/pages" className="text-sm text-white/50 hover:text-white">
        ← All Pages
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">New Page</h1>
      <SaveBanner error={params.error} />
      <PageForm />
    </div>
  );
}
