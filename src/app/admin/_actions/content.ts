"use server";

import { redirect } from "next/navigation";
import { revalidate } from "@/lib/revalidate";
import {
  createService,
  updateService,
  deleteService,
  getServiceBySlug,
} from "@/lib/db/services";
import {
  createProject,
  updateProject,
  deleteProject,
  getProjectBySlug,
} from "@/lib/db/projects";
import {
  createLocation,
  updateLocation,
  deleteLocation,
  getLocationBySlug,
} from "@/lib/db/locations";
import { updateSettings } from "@/lib/db/settings";
import type { Service, Project, Location } from "@/data/site";
import { parseContentBlocks } from "./contentBlocks";
import { parseFaqs } from "./faqs";

function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function splitCommas(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function revalidateServiceRoutes(slug: string) {
  await revalidate("/services");
  await revalidate(`/services/${slug}`);
  await revalidate("/locations/[locationSlug]/[serviceSlug]", "page");
  await revalidate("/");
  await revalidate("/sitemap.xml");
}

async function revalidateProjectRoutes(slug: string) {
  await revalidate("/projects");
  await revalidate(`/projects/${slug}`);
  await revalidate("/services/[slug]", "page");
  await revalidate("/locations/[locationSlug]/[serviceSlug]", "page");
  await revalidate("/");
  await revalidate("/sitemap.xml");
}

async function revalidateLocationRoutes(slug: string) {
  await revalidate("/locations");
  await revalidate(`/locations/${slug}`);
  await revalidate("/locations/[locationSlug]/[serviceSlug]", "page");
  await revalidate("/");
  await revalidate("/sitemap.xml");
}

function readServiceFields(formData: FormData) {
  return {
    title: String(formData.get("title") || "").trim(),
    shortName: String(formData.get("shortName") || "").trim(),
    description: String(formData.get("description") || "").trim(),
    image: String(formData.get("image") || "").trim(),
    imageAlt: String(formData.get("imageAlt") || "").trim(),
    formCategory: String(formData.get("formCategory") || "").trim(),
    highlights: splitLines(String(formData.get("highlights") || "")),
    metaTitle: String(formData.get("metaTitle") || "").trim(),
    metaDescription: String(formData.get("metaDescription") || "").trim(),
    content: parseContentBlocks(formData),
    faqs: parseFaqs(formData),
  };
}

export async function saveServiceAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") || "");
  const fields = readServiceFields(formData);

  try {
    await updateService(slug, fields);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    redirect(`/admin/services?error=${encodeURIComponent(message)}`);
  }

  await revalidateServiceRoutes(slug);
  redirect("/admin/services?saved=1");
}

export async function createServiceAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") || "").trim();
  const fields = readServiceFields(formData);

  if (!slug || !fields.title) {
    redirect(
      `/admin/services/new?error=${encodeURIComponent("Slug and title are required")}`,
    );
  }

  if (await getServiceBySlug(slug)) {
    redirect(
      `/admin/services/new?error=${encodeURIComponent("A service with that slug already exists")}`,
    );
  }

  const service: Service = { slug, ...fields };

  try {
    await createService(service);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    redirect(`/admin/services/new?error=${encodeURIComponent(message)}`);
  }

  await revalidateServiceRoutes(slug);
  redirect("/admin/services?saved=1");
}

export async function deleteServiceAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") || "");

  try {
    await deleteService(slug);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    redirect(`/admin/services?error=${encodeURIComponent(message)}`);
  }

  await revalidateServiceRoutes(slug);
  redirect("/admin/services?deleted=1");
}

function readProjectFields(formData: FormData) {
  // MultiImageUploadField posts one `gallery` and one `galleryAlt` value per
  // image, in the same order, so the two arrays line up by index.
  const gallery = formData.getAll("gallery").map((v) => String(v).trim()).filter(Boolean);
  const galleryAlt = formData.getAll("galleryAlt").map((v) => String(v).trim());
  const overview = splitLines(String(formData.get("overview") || ""));

  return {
    category: String(formData.get("category") || "").trim(),
    service: String(formData.get("service") || "").trim(),
    title: String(formData.get("title") || "").trim(),
    description: String(formData.get("description") || "").trim(),
    before: String(formData.get("before") || "").trim(),
    beforeAlt: String(formData.get("beforeAlt") || "").trim(),
    after: String(formData.get("after") || "").trim(),
    afterAlt: String(formData.get("afterAlt") || "").trim(),
    ...(gallery.length ? { gallery } : {}),
    ...(galleryAlt.some(Boolean) ? { galleryAlt } : {}),
    ...(overview.length ? { overview } : {}),
  };
}

export async function saveProjectAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") || "");
  const fields = readProjectFields(formData);

  try {
    await updateProject(slug, fields);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    redirect(`/admin/projects?error=${encodeURIComponent(message)}`);
  }

  await revalidateProjectRoutes(slug);
  redirect("/admin/projects?saved=1");
}

export async function createProjectAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") || "").trim();
  const fields = readProjectFields(formData);

  if (!slug || !fields.title) {
    redirect(
      `/admin/projects/new?error=${encodeURIComponent("Slug and title are required")}`,
    );
  }

  if (await getProjectBySlug(slug)) {
    redirect(
      `/admin/projects/new?error=${encodeURIComponent("A project with that slug already exists")}`,
    );
  }

  const project: Project = { slug, ...fields };

  try {
    await createProject(project);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    redirect(`/admin/projects/new?error=${encodeURIComponent(message)}`);
  }

  await revalidateProjectRoutes(slug);
  redirect("/admin/projects?saved=1");
}

export async function deleteProjectAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") || "");

  try {
    await deleteProject(slug);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    redirect(`/admin/projects?error=${encodeURIComponent(message)}`);
  }

  await revalidateProjectRoutes(slug);
  redirect("/admin/projects?deleted=1");
}

function readLocationFields(formData: FormData) {
  return {
    name: String(formData.get("name") || "").trim(),
    region: String(formData.get("region") || "").trim(),
    image: String(formData.get("image") || "").trim(),
    imageAlt: String(formData.get("imageAlt") || "").trim(),
    tagline: String(formData.get("tagline") || "").trim(),
    blurb: String(formData.get("blurb") || "").trim(),
    nearbyAreas: splitCommas(String(formData.get("nearbyAreas") || "")),
    isHomeBase: formData.get("isHomeBase") === "on",
    metaTitle: String(formData.get("metaTitle") || "").trim(),
    metaDescription: String(formData.get("metaDescription") || "").trim(),
    content: parseContentBlocks(formData),
    faqs: parseFaqs(formData),
  };
}

export async function saveLocationAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") || "");
  const fields = readLocationFields(formData);

  try {
    await updateLocation(slug, fields);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    redirect(`/admin/locations?error=${encodeURIComponent(message)}`);
  }

  await revalidateLocationRoutes(slug);
  redirect("/admin/locations?saved=1");
}

export async function createLocationAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") || "").trim();
  const fields = readLocationFields(formData);

  if (!slug || !fields.name) {
    redirect(
      `/admin/locations/new?error=${encodeURIComponent("Slug and name are required")}`,
    );
  }

  if (await getLocationBySlug(slug)) {
    redirect(
      `/admin/locations/new?error=${encodeURIComponent("A location with that slug already exists")}`,
    );
  }

  const location: Location = { slug, ...fields };

  try {
    await createLocation(location);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    redirect(`/admin/locations/new?error=${encodeURIComponent(message)}`);
  }

  await revalidateLocationRoutes(slug);
  redirect("/admin/locations?saved=1");
}

export async function deleteLocationAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") || "");

  try {
    await deleteLocation(slug);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    redirect(`/admin/locations?error=${encodeURIComponent(message)}`);
  }

  await revalidateLocationRoutes(slug);
  redirect("/admin/locations?deleted=1");
}

export async function saveSettingsAction(formData: FormData): Promise<void> {
  const phone = String(formData.get("phone") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const addressLine1 = String(formData.get("addressLine1") || "").trim();
  const addressCity = String(formData.get("addressCity") || "").trim();
  const addressRegion = String(formData.get("addressRegion") || "").trim();
  const addressPostcode = String(formData.get("addressPostcode") || "").trim();
  const companyNo = String(formData.get("companyNo") || "").trim();
  const facebook = String(formData.get("facebook") || "").trim();
  const instagram = String(formData.get("instagram") || "").trim();
  const linkedin = String(formData.get("linkedin") || "").trim();
  const description = String(formData.get("description") || "").trim();

  // Format: "value | label" per line
  const stats = splitLines(String(formData.get("stats") || ""))
    .map((line) => {
      const [value, label] = line.split("|").map((s) => s.trim());
      return { value: value || "", label: label || "" };
    })
    .filter((s) => s.value && s.label);

  // Format: "title | description" per line
  const whyChooseUs = splitLines(String(formData.get("whyChooseUs") || ""))
    .map((line) => {
      const [title, desc] = line.split("|").map((s) => s.trim());
      return { title: title || "", description: desc || "" };
    })
    .filter((w) => w.title && w.description);

  try {
    await updateSettings({
      phone,
      email,
      description,
      companyNo,
      address: {
        line1: addressLine1,
        city: addressCity,
        region: addressRegion,
        postcode: addressPostcode,
      },
      social: { facebook, instagram, linkedin },
      ...(stats.length ? { stats } : {}),
      ...(whyChooseUs.length ? { whyChooseUs } : {}),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    redirect(`/admin/settings?error=${encodeURIComponent(message)}`);
  }

  await revalidate("/", "layout");
  redirect("/admin/settings?saved=1");
}
