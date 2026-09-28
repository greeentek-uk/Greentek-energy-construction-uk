import { redirect } from "next/navigation";

/**
 * The old flat list of every block. Content is now reached page by page from
 * /admin/content; this keeps old links (and the publish action's redirect,
 * with its count) working.
 */
export default async function PageContentListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams(
    Object.entries(params).filter((e): e is [string, string] => typeof e[1] === "string"),
  ).toString();
  redirect(`/admin/content${query ? `?${query}` : ""}`);
}
