import { getSitemapConfig } from "@/lib/db/sitemapSettings";
import { getCurrentSiteConfig, getCurrentBlogPosts, getCurrentSeoOverrides } from "@/lib/cms";
import { SITEMAP_SECTION_LABELS, isExcluded, type SitemapConfig } from "@/lib/sitemapConfig";
import { CHANGE_FREQUENCIES } from "@/lib/seoTypes";
import { saveSitemapConfigAction } from "../../_actions/sitemap";
import SaveBanner from "../../_components/SaveBanner";

interface Props {
  searchParams: Promise<{ saved?: string; error?: string }>;
}

const input =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all";

type SectionKey = keyof SitemapConfig["sections"];

export default async function SitemapPage({ searchParams }: Props) {
  const [params, config, site, posts, overrides] = await Promise.all([
    searchParams,
    getSitemapConfig(),
    getCurrentSiteConfig(),
    getCurrentBlogPosts(),
    getCurrentSeoOverrides(),
  ]);

  // Same filters the sitemap route applies, so the counts match the real file.
  const counts: Record<SectionKey, number> = {
    services: site.services.length,
    projects: site.projects.length,
    locations: site.locations.length,
    locationServices: site.locations.length * site.services.length,
    blog: posts.length,
  };

  const suppressed = Object.entries(overrides).filter(
    ([, o]) => o.noindex || o.excludeFromSitemap,
  );

  const totalIncluded = (Object.keys(counts) as SectionKey[]).reduce(
    (sum, key) => sum + (config.sections[key].enabled ? counts[key] : 0),
    config.includeStaticPages ? 11 : 0,
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Sitemap</h1>
      <p className="text-white/50 mb-6 text-sm">
        Controls which URLs appear in{" "}
        <a
          href="/sitemap.xml"
          target="_blank"
          rel="noreferrer"
          className="text-white/70 hover:text-white underline"
        >
          /sitemap.xml
        </a>
        . Roughly {totalIncluded} URLs are included right now, before exclusions.
      </p>

      <SaveBanner saved={params.saved === "1"} error={params.error} />

      <form action={saveSitemapConfigAction} className="space-y-6">
        <div className="bg-[#101314] border border-white/10 rounded-xl p-6 space-y-4">
          <label className="flex items-start gap-2 text-sm text-white/70">
            <input
              type="checkbox"
              name="includeStaticPages"
              defaultChecked={config.includeStaticPages}
              className="accent-[#c5eb02] mt-1"
            />
            <span>
              Static pages
              <span className="block text-xs text-white/40">
                Home, About, Services, Projects, Locations, Blog, Contact, Privacy, Terms
                and the two solutions pages.
              </span>
            </span>
          </label>
          <div className="max-w-[200px]">
            <label className="block text-xs font-semibold text-white/70 mb-1">
              Priority
            </label>
            <input
              name="staticPriority"
              type="number"
              min={0}
              max={1}
              step={0.1}
              defaultValue={config.staticPriority}
              className={input}
            />
          </div>
        </div>

        {(Object.keys(SITEMAP_SECTION_LABELS) as SectionKey[]).map((key) => {
          const meta = SITEMAP_SECTION_LABELS[key];
          const section = config.sections[key];
          return (
            <div key={key} className="bg-[#101314] border border-white/10 rounded-xl p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <label className="flex items-start gap-2 text-sm text-white/70">
                  <input
                    type="checkbox"
                    name={`${key}_enabled`}
                    defaultChecked={section.enabled}
                    className="accent-[#c5eb02] mt-1"
                  />
                  <span>
                    {meta.label}
                    <span className="block text-xs text-white/40">{meta.help}</span>
                  </span>
                </label>
                <span className="shrink-0 text-[10px] font-bold uppercase text-white/50 bg-white/5 px-2 py-1 rounded-full">
                  {counts[key]} URLs
                </span>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">
                    Priority
                  </label>
                  <input
                    name={`${key}_priority`}
                    type="number"
                    min={0}
                    max={1}
                    step={0.1}
                    defaultValue={section.priority}
                    className={input}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">
                    Change frequency
                  </label>
                  <select
                    name={`${key}_changeFrequency`}
                    defaultValue={section.changeFrequency}
                    className={input}
                  >
                    {CHANGE_FREQUENCIES.map((freq) => (
                      <option key={freq} value={freq}>
                        {freq}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          );
        })}

        <div className="bg-[#101314] border border-white/10 rounded-xl p-6">
          <h2 className="font-bold text-white mb-1">Excluded paths</h2>
          <p className="text-white/50 text-sm mb-3">
            One per line. Use a trailing <code className="bg-white/5 px-1 rounded">*</code>{" "}
            to exclude a whole branch, e.g.{" "}
            <code className="bg-white/5 px-1 rounded">/locations/cardiff/*</code>.
          </p>
          <textarea
            name="excludedPaths"
            defaultValue={config.excludedPaths.join("\n")}
            rows={5}
            spellCheck={false}
            className={`${input} font-mono`}
          />

          {suppressed.length > 0 && (
            <div className="mt-4 border-t border-white/10 pt-4">
              <p className="text-xs font-semibold text-white/70 mb-2">
                Also excluded by their own page settings ({suppressed.length})
              </p>
              <ul className="space-y-1">
                {suppressed.slice(0, 12).map(([path, override]) => (
                  <li key={path} className="text-xs text-white/40 flex items-center gap-2">
                    <span className="truncate">{path}</span>
                    <span className="shrink-0 text-[10px] font-bold uppercase text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded-full">
                      {override.noindex ? "noindex" : "excluded"}
                    </span>
                  </li>
                ))}
              </ul>
              {suppressed.length > 12 && (
                <p className="text-xs text-white/30 mt-1">
                  and {suppressed.length - 12} more.
                </p>
              )}
            </div>
          )}

          {config.excludedPaths.length > 0 && isExcluded("/", config.excludedPaths) && (
            <p className="mt-3 text-xs text-amber-300">
              ⚠ Your exclusion list currently matches the home page.
            </p>
          )}
        </div>

        <button
          type="submit"
          className="rounded-lg bg-[#c5eb02] text-black text-sm font-semibold px-6 py-3 hover:bg-[#c5eb02]/80"
        >
          Save Sitemap Settings
        </button>
      </form>
    </div>
  );
}
