import Link from "next/link";
import { getCurrentSiteConfig } from "@/lib/cms";
import { deleteProjectAction } from "../../_actions/content";
import SaveBanner from "../../_components/SaveBanner";
import ProjectForm from "../../_components/ProjectForm";
import ConfirmSubmitButton from "../../_components/ConfirmSubmitButton";

interface Props {
  searchParams: Promise<{ saved?: string; deleted?: string; error?: string }>;
}

export default async function ProjectsAdminPage({ searchParams }: Props) {
  const params = await searchParams;
  const { projects, services } = await getCurrentSiteConfig();

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Link
          href="/admin/projects/new"
          className="rounded-lg bg-[#c5eb02] text-black text-sm font-semibold px-4 py-2 hover:bg-[#c5eb02]/80"
        >
          + New Project
        </Link>
      </div>
      <p className="text-white/50 mb-6 text-sm">
        Edit each project&apos;s before/after images, description, and gallery.
      </p>

      <SaveBanner
        saved={params.saved === "1" || params.deleted === "1"}
        error={params.error}
      />

      <div className="space-y-3">
        {projects.map((project) => (
          <div
            key={project.slug}
            className="bg-[#101314] border border-white/10 rounded-xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4">
              <span className="font-semibold text-white">{project.title}</span>
              <form action={deleteProjectAction}>
                <input type="hidden" name="slug" value={project.slug} />
                <ConfirmSubmitButton
                  message={`Delete "${project.title}"? This cannot be undone.`}
                  className="text-xs font-semibold text-red-400 hover:text-red-300"
                >
                  Delete
                </ConfirmSubmitButton>
              </form>
            </div>
            <details>
              <summary className="cursor-pointer px-5 py-2 text-sm text-white/50 hover:bg-white/5 border-t border-white/10">
                Edit details
              </summary>
              <div className="px-5 pb-5 pt-2">
                <ProjectForm initial={project} services={services} />
              </div>
            </details>
          </div>
        ))}
        {projects.length === 0 && (
          <p className="text-sm text-white/40">No projects yet.</p>
        )}
      </div>
    </div>
  );
}
