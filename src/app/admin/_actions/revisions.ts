"use server";

import { redirect } from "next/navigation";
import { revalidate } from "@/lib/revalidate";
import { getRevision } from "@/lib/db/revisions";
import { updatePage } from "@/lib/db/pages";
import { updateService } from "@/lib/db/services";
import { updateLocation } from "@/lib/db/locations";
import { updateProject } from "@/lib/db/projects";
import { updateBlogPost } from "@/lib/db/blogPosts";
import { saveBlockDraft } from "@/lib/db/pageContent";
import type { SitePage } from "@/data/pages";
import type { Service, Location, Project } from "@/data/site";
import type { BlogPost } from "@/data/blogs";
import type { PageContentKey, PageContentMap } from "@/data/pageContent";

/**
 * Puts a saved snapshot back.
 *
 * Restoring is itself a write, so the current version is snapshotted first by
 * the underlying update functions — meaning a restore can be undone the same
 * way, and someone can't trap themselves by restoring the wrong one.
 */
export async function restoreRevisionAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") || "");
  const revision = await getRevision(id);

  if (!revision) {
    redirect(`/admin/revisions?error=${encodeURIComponent("That revision no longer exists")}`);
  }

  try {
    switch (revision.scope) {
      case "pages":
        await updatePage(revision.docId, revision.snapshot as SitePage);
        await revalidate(`/${revision.docId}`);
        break;
      case "services": {
        const { slug, ...rest } = revision.snapshot as Service;
        await updateService(revision.docId, rest);
        await revalidate(`/services/${slug}`);
        break;
      }
      case "locations": {
        const { slug, ...rest } = revision.snapshot as Location;
        await updateLocation(revision.docId, rest);
        await revalidate(`/locations/${slug}`);
        break;
      }
      case "projects": {
        const { slug, ...rest } = revision.snapshot as Project;
        await updateProject(revision.docId, rest);
        await revalidate(`/projects/${slug}`);
        break;
      }
      case "blogPosts":
        await updateBlogPost(revision.docId, revision.snapshot as BlogPost);
        await revalidate(`/blog/${revision.docId}`);
        break;
      case "pageContent":
        await saveBlockDraft(
          revision.docId as PageContentKey,
          revision.snapshot as PageContentMap[PageContentKey],
        );
        break;
      default:
        redirect(
          `/admin/revisions?error=${encodeURIComponent("That content type can't be restored")}`,
        );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    redirect(`/admin/revisions?error=${encodeURIComponent(message)}`);
  }

  await revalidate("/sitemap.xml");
  redirect(`/admin/revisions?restored=${encodeURIComponent(revision.label)}`);
}
