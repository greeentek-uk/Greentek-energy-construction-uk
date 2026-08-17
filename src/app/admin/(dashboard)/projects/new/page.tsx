import Link from "next/link";
import { getCurrentSiteConfig } from "@/lib/cms";
import ProjectForm from "../../../_components/ProjectForm";
import SaveBanner from "../../../_components/SaveBanner";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function NewProjectPage({ searchParams }: Props) {
  const params = await searchParams;
  const { services } = await getCurrentSiteConfig();

  return (
    <div>
      <Link href="/admin/projects" className="text-sm text-zinc-500 hover:text-zinc-900">
        ← All Projects
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">New Project</h1>

      <SaveBanner error={params.error} />

      <div className="bg-white border border-zinc-200 rounded-xl p-6">
        <ProjectForm services={services} />
      </div>
    </div>
  );
}
