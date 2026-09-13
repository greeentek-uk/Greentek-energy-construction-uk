import { getRobotsConfig, getLlmsConfig } from "@/lib/db/siteFiles";
import { buildLlmsTxt } from "@/lib/siteFileDefaults";
import { SITE_URL } from "@/lib/structuredData";
import SaveBanner from "../../_components/SaveBanner";
import RobotsEditor from "../../_components/RobotsEditor";
import LlmsEditor from "../../_components/LlmsEditor";

interface Props {
  searchParams: Promise<{ saved?: string; error?: string }>;
}

export default async function SiteFilesPage({ searchParams }: Props) {
  const [params, robots, llms] = await Promise.all([
    searchParams,
    getRobotsConfig(),
    getLlmsConfig(),
  ]);

  // Built here rather than in the client editor because assembling it needs the
  // live services, locations and posts.
  const llmsPreview = await buildLlmsTxt({ ...llms, mode: "generated" });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">robots.txt &amp; llms.txt</h1>
      <p className="text-white/50 mb-6 text-sm">
        Both files are served live from here — no redeploy needed.
      </p>

      <SaveBanner saved={Boolean(params.saved)} error={params.error} />

      <div className="bg-[#101314] border border-white/10 rounded-xl p-6 mb-8">
        <h2 className="font-bold text-white mb-1">robots.txt</h2>
        <p className="text-white/50 text-sm mb-5">
          Tells search engines and AI crawlers what they may fetch.
        </p>
        <RobotsEditor initial={robots} siteUrl={SITE_URL} />
      </div>

      <div className="bg-[#101314] border border-white/10 rounded-xl p-6">
        <h2 className="font-bold text-white mb-1">llms.txt</h2>
        <p className="text-white/50 text-sm mb-5">
          A plain-text map of the site for AI assistants, following the llmstxt.org
          convention. Built from your live content, so it stays current on its own.
        </p>
        <LlmsEditor initial={llms} generatedPreview={llmsPreview} />
      </div>
    </div>
  );
}
