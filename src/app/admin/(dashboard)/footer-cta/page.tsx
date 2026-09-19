import { getFooterCtaSettings } from "@/lib/db/footerCta";
import { getAllRoutes } from "@/lib/routes";
import { getPublishedPages } from "@/lib/db/pages";
import { deleteFooterCtaOverrideAction } from "../../_actions/footerCta";
import SaveBanner from "../../_components/SaveBanner";
import ConfirmSubmitButton from "../../_components/ConfirmSubmitButton";
import FooterCtaForm from "../../_components/FooterCtaForm";

interface Props {
  searchParams: Promise<{ saved?: string; deleted?: string; error?: string }>;
}

/** Wildcards worth offering, alongside every real page. */
const SECTION_PATTERNS = ["/services/*", "/locations/*", "/projects/*", "/blog/*"];

export default async function FooterCtaAdminPage({ searchParams }: Props) {
  const [params, settings, routes, pages] = await Promise.all([
    searchParams,
    getFooterCtaSettings(),
    getAllRoutes(),
    getPublishedPages(),
  ]);

  const suggestions = [
    ...SECTION_PATTERNS,
    ...routes.map((r) => r.path),
    ...pages.map((p) => `/${p.slug}`),
    "/finance",
    "/energy-solutions",
    "/home-solutions",
  ].filter((p) => !settings.overrides.some((o) => o.path === p));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Footer CTA</h1>
      <p className="text-white/50 mb-6 text-sm">
        The heading, text and buttons at the top of the footer. The default shows on every
        page; add an override to change it for one page, or for a whole section with a
        path ending in <code>{"/*"}</code>.
      </p>

      <SaveBanner
        saved={params.saved === "1" || params.deleted === "1"}
        error={params.error}
      />

      <datalist id="footer-cta-paths">
        {[...new Set(suggestions)].map((path) => (
          <option key={path} value={path} />
        ))}
      </datalist>

      <section className="mb-8 bg-[#101314] border border-white/10 rounded-xl p-6">
        <h2 className="font-bold text-white mb-1">Default — all pages</h2>
        <p className="text-xs text-white/50 mb-5">
          Used on every page without an override of its own.
        </p>
        <FooterCtaForm target="default" cta={settings.default} />
      </section>

      <h2 className="font-bold text-white mb-3">
        Page overrides{" "}
        <span className="text-white/40 font-normal">({settings.overrides.length})</span>
      </h2>
      <div className="space-y-3 mb-8">
        {settings.overrides.length === 0 && (
          <p className="text-sm text-white/50">No overrides yet — every page uses the default.</p>
        )}
        {settings.overrides.map((override) => (
          <details
            key={override.path}
            className="bg-[#101314] border border-white/10 rounded-xl p-5"
          >
            <summary className="cursor-pointer font-semibold text-white">
              <code>{override.path}</code>
              <span className="ml-3 text-sm font-normal text-white/50">
                {override.cta.heading.split("\n").join(" ")}
              </span>
            </summary>
            <div className="mt-5 space-y-4">
              <FooterCtaForm target={override.path} path={override.path} cta={override.cta} />
              <form action={deleteFooterCtaOverrideAction}>
                <input type="hidden" name="path" value={override.path} />
                <ConfirmSubmitButton
                  message={`Remove the footer override for ${override.path}? That page will use the default again.`}
                  className="text-sm font-semibold text-red-400 hover:text-red-300"
                >
                  Remove override
                </ConfirmSubmitButton>
              </form>
            </div>
          </details>
        ))}
      </div>

      <section className="bg-[#101314] border border-dashed border-white/20 rounded-xl p-6">
        <h2 className="font-bold text-white mb-1">Add a page override</h2>
        <p className="text-xs text-white/50 mb-5">
          Starts from the default — change what you need.
        </p>
        <FooterCtaForm target="" cta={settings.default} submitLabel="Add override" />
      </section>
    </div>
  );
}
