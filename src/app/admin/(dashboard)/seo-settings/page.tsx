import { getSeoTemplates } from "@/lib/db/seoSettings";
import { getBreadcrumbSettings } from "@/lib/db/breadcrumbs";
import { TEMPLATE_VARIABLES } from "@/lib/seoTemplates";
import { TWITTER_CARDS } from "@/lib/seoTypes";
import { saveSeoTemplatesAction } from "../../_actions/seo";
import SaveBanner from "../../_components/SaveBanner";

interface Props {
  searchParams: Promise<{ saved?: string; error?: string }>;
}

const input =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all";

const PAGE_TYPES = [
  { key: "home", label: "Home page" },
  { key: "service", label: "Service pages" },
  { key: "location", label: "Location pages" },
  { key: "locationService", label: "Location + service pages" },
  { key: "project", label: "Project pages" },
  { key: "blog", label: "Blog posts" },
] as const;

const VERIFICATIONS = [
  { key: "verifyGoogle", label: "Google Search Console", help: "The content value from the google-site-verification meta tag." },
  { key: "verifyBing", label: "Bing Webmaster Tools", help: "The msvalidate.01 value." },
  { key: "verifyYandex", label: "Yandex", help: "The yandex-verification value." },
  { key: "verifyPinterest", label: "Pinterest", help: "The p:domain_verify value." },
  { key: "verifyBaidu", label: "Baidu", help: "The baidu-site-verification value." },
] as const;

export default async function SeoSettingsPage({ searchParams }: Props) {
  const [params, templates, breadcrumbs] = await Promise.all([
    searchParams,
    getSeoTemplates(),
    getBreadcrumbSettings(),
  ]);

  const stored = {
    verifyGoogle: templates.verification.google,
    verifyBing: templates.verification.bing,
    verifyYandex: templates.verification.yandex,
    verifyPinterest: templates.verification.pinterest,
    verifyBaidu: templates.verification.baidu,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">SEO Settings</h1>
      <p className="text-white/50 mb-6 text-sm">
        Site-wide title and description patterns, social defaults, verification codes and
        breadcrumbs. A per-page override in{" "}
        <span className="text-white/70">Page SEO</span> always wins over these.
      </p>

      <SaveBanner saved={params.saved === "1"} error={params.error} />

      <form action={saveSeoTemplatesAction} className="space-y-8">
        <section className="bg-[#101314] border border-white/10 rounded-xl p-6 space-y-4">
          <div>
            <h2 className="font-bold text-white mb-1">Title &amp; description templates</h2>
            <p className="text-white/50 text-sm">
              Change the house style for a whole page type at once.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">
                Separator
              </label>
              <input name="separator" defaultValue={templates.separator} className={input} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">
                Fallback title template
              </label>
              <input
                name="defaultTitle"
                defaultValue={templates.defaultTitle}
                className={input}
              />
            </div>
          </div>

          {PAGE_TYPES.map((type) => (
            <div
              key={type.key}
              className="border border-white/10 rounded-lg p-4 space-y-3 bg-white/5"
            >
              <p className="text-xs font-semibold text-white/50">{type.label}</p>
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Title
                </label>
                <input
                  name={`${type.key}_title`}
                  defaultValue={templates[type.key].title}
                  className={input}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Description
                </label>
                <input
                  name={`${type.key}_description`}
                  defaultValue={templates[type.key].description}
                  className={input}
                />
              </div>
            </div>
          ))}

          <details className="border border-white/10 rounded-lg">
            <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-white hover:bg-white/5">
              Available variables
            </summary>
            <div className="px-4 pb-4 grid sm:grid-cols-2 gap-x-6 gap-y-1">
              {TEMPLATE_VARIABLES.map((variable) => (
                <p key={variable.token} className="text-xs text-white/50">
                  <code className="bg-white/5 px-1 rounded text-[#c5eb02]">
                    {variable.token}
                  </code>{" "}
                  {variable.description}
                </p>
              ))}
            </div>
          </details>
        </section>

        <section className="bg-[#101314] border border-white/10 rounded-xl p-6 space-y-4">
          <div>
            <h2 className="font-bold text-white mb-1">Social defaults</h2>
            <p className="text-white/50 text-sm">
              Used when a page sets no share image or card of its own.
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1">
              Default share image URL
            </label>
            <input
              name="defaultOgImage"
              defaultValue={templates.defaultOgImage}
              placeholder="https://… — 1200×630 works best"
              className={input}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">
                X / Twitter handle
              </label>
              <input
                name="twitterSite"
                defaultValue={templates.twitterSite}
                placeholder="@greentek"
                className={input}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">
                Default card type
              </label>
              <select
                name="defaultTwitterCard"
                defaultValue={templates.defaultTwitterCard}
                className={input}
              >
                {TWITTER_CARDS.map((card) => (
                  <option key={card} value={card}>
                    {card}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="bg-[#101314] border border-white/10 rounded-xl p-6 space-y-4">
          <div>
            <h2 className="font-bold text-white mb-1">Site verification</h2>
            <p className="text-white/50 text-sm">
              Paste just the code, not the whole meta tag. Each one is output site-wide.
            </p>
          </div>
          {VERIFICATIONS.map((item) => (
            <div key={item.key}>
              <label className="block text-xs font-semibold text-white/70 mb-1">
                {item.label}
              </label>
              <input
                name={item.key}
                defaultValue={stored[item.key]}
                className={input}
              />
              <p className="text-xs text-white/40 mt-1">{item.help}</p>
            </div>
          ))}
        </section>

        <section className="bg-[#101314] border border-white/10 rounded-xl p-6 space-y-4">
          <div>
            <h2 className="font-bold text-white mb-1">Breadcrumbs</h2>
            <p className="text-white/50 text-sm">
              Shown on service, location, project and blog pages, with matching
              BreadcrumbList markup so they can appear in search results.
            </p>
          </div>
          <label className="flex items-start gap-2 text-sm text-white/70">
            <input
              type="checkbox"
              name="breadcrumbsEnabled"
              defaultChecked={breadcrumbs.enabled}
              className="accent-[#c5eb02] mt-1"
            />
            <span>Show breadcrumbs</span>
          </label>
          <label className="flex items-start gap-2 text-sm text-white/70">
            <input
              type="checkbox"
              name="breadcrumbsShowHome"
              defaultChecked={breadcrumbs.showHome}
              className="accent-[#c5eb02] mt-1"
            />
            <span>Start the trail with a home link</span>
          </label>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">
                Home label
              </label>
              <input
                name="breadcrumbsHomeLabel"
                defaultValue={breadcrumbs.homeLabel}
                className={input}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">
                Separator
              </label>
              <select
                name="breadcrumbsSeparator"
                defaultValue={breadcrumbs.separator}
                className={input}
              >
                <option value="chevron">Chevron icon</option>
                <option value="/">Slash /</option>
                <option value="›">Angle ›</option>
                <option value="—">Dash —</option>
              </select>
            </div>
          </div>
        </section>

        <button
          type="submit"
          className="rounded-lg bg-[#c5eb02] text-black text-sm font-semibold px-6 py-3 hover:bg-[#c5eb02]/80"
        >
          Save SEO Settings
        </button>
      </form>
    </div>
  );
}
