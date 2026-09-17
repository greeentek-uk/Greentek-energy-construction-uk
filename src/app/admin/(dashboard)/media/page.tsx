import Link from "next/link";
import { listMedia } from "@/lib/cloudinary";
import { collectImageUsage } from "@/lib/mediaUsage";
import { deleteMediaAction } from "../../_actions/media";
import SaveBanner from "../../_components/SaveBanner";
import ConfirmSubmitButton from "../../_components/ConfirmSubmitButton";

interface Props {
  searchParams: Promise<{ deleted?: string; error?: string; filter?: string }>;
}

function kb(bytes: number): string {
  if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

export default async function MediaPage({ searchParams }: Props) {
  const params = await searchParams;

  const [usage, assets] = await Promise.all([
    collectImageUsage(),
    listMedia().catch(() => null),
  ]);

  const missingAlt = usage.filter((item) => !item.alt);
  const showing = params.filter === "missing-alt" ? missingAlt : usage;
  const usedUrls = new Map(usage.map((item) => [item.url, item]));

  const orphaned = (assets ?? []).filter((asset) => !usedUrls.has(asset.url));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Media</h1>
      <p className="text-white/50 mb-6 text-sm">
        Every image on the site, where it&apos;s used, and whether it has alt text.
      </p>

      <SaveBanner saved={params.deleted === "1"} error={params.error} />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-[#101314] border border-white/10 rounded-xl p-4">
          <p className="text-2xl font-bold text-white">{usage.length}</p>
          <p className="text-xs text-white/50">images in use</p>
        </div>
        <div className="bg-[#101314] border border-white/10 rounded-xl p-4">
          <p className={`text-2xl font-bold ${missingAlt.length ? "text-amber-300" : "text-green-400"}`}>
            {missingAlt.length}
          </p>
          <p className="text-xs text-white/50">missing alt text</p>
        </div>
        <div className="bg-[#101314] border border-white/10 rounded-xl p-4">
          <p className="text-2xl font-bold text-white">{assets === null ? "—" : orphaned.length}</p>
          <p className="text-xs text-white/50">uploaded but unused</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <Link
          href="/admin/media"
          className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
            params.filter !== "missing-alt"
              ? "bg-[#c5eb02] text-black"
              : "border border-white/15 text-white/70 hover:text-white"
          }`}
        >
          All in use ({usage.length})
        </Link>
        <Link
          href="/admin/media?filter=missing-alt"
          className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
            params.filter === "missing-alt"
              ? "bg-[#c5eb02] text-black"
              : "border border-white/15 text-white/70 hover:text-white"
          }`}
        >
          Missing alt ({missingAlt.length})
        </Link>
      </div>

      <div className="bg-[#101314] border border-white/10 rounded-xl divide-y divide-white/10 mb-8">
        {showing.length === 0 && (
          <p className="text-sm text-white/40 px-5 py-10 text-center">
            {params.filter === "missing-alt"
              ? "Every image in use has alt text."
              : "No images found."}
          </p>
        )}
        {showing.map((item) => (
          <div key={item.url} className="flex items-start gap-4 px-4 py-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.url}
              alt=""
              className="w-20 h-16 shrink-0 object-cover rounded-md border border-white/10 bg-white/5"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-white/80">
                {item.alt || (
                  <span className="text-amber-300 font-semibold">No alt text</span>
                )}
              </p>
              <p className="text-xs text-white/40 mt-0.5">{item.usedIn.join(" · ")}</p>
            </div>
          </div>
        ))}
      </div>

      {assets === null ? (
        <p className="text-sm text-white/40 bg-[#101314] border border-white/10 rounded-xl px-5 py-6">
          Couldn&apos;t reach Cloudinary to list uploaded files. The in-use list above is
          built from your own content and is unaffected.
        </p>
      ) : (
        orphaned.length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase text-white/50 mb-3">
              Uploaded but not used anywhere ({orphaned.length})
            </h2>
            <div className="bg-[#101314] border border-white/10 rounded-xl divide-y divide-white/10">
              {orphaned.map((asset) => (
                <div key={asset.publicId} className="flex items-center gap-4 px-4 py-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset.url}
                    alt=""
                    className="w-20 h-16 shrink-0 object-cover rounded-md border border-white/10 bg-white/5"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-white/50 font-mono truncate">{asset.publicId}</p>
                    <p className="text-xs text-white/40">
                      {asset.width}×{asset.height} · {kb(asset.bytes)}
                    </p>
                  </div>
                  <form action={deleteMediaAction} className="shrink-0">
                    <input type="hidden" name="publicId" value={asset.publicId} />
                    <ConfirmSubmitButton
                      message="Delete this file from Cloudinary permanently? It isn't used on any page."
                      className="text-sm font-semibold text-red-400 hover:underline"
                    >
                      Delete
                    </ConfirmSubmitButton>
                  </form>
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}
