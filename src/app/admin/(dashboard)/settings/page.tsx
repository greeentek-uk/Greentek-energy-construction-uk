import { getCurrentSiteConfig } from "@/lib/cms";
import { saveSettingsAction } from "../../_actions/content";
import SaveBanner from "../../_components/SaveBanner";

interface Props {
  searchParams: Promise<{ saved?: string; error?: string }>;
}

export default async function SettingsAdminPage({ searchParams }: Props) {
  const params = await searchParams;
  const site = await getCurrentSiteConfig();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Company Settings</h1>
      <p className="text-white/50 mb-6 text-sm">
        Contact details, social links, homepage stats, and the &quot;Why
        Choose Us&quot; cards.
      </p>

      <SaveBanner saved={params.saved === "1"} error={params.error} />

      <form
        action={saveSettingsAction}
        className="space-y-6 bg-[#101314] border border-white/10 rounded-xl p-6"
      >
        <div>
          <label className="block text-xs font-semibold text-white/70 mb-1">
            Company Description
          </label>
          <textarea
            name="description"
            defaultValue={site.description}
            rows={3}
            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1">
              Phone
            </label>
            <input
              name="phone"
              defaultValue={site.phone}
              required
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1">
              Email
            </label>
            <input
              name="email"
              defaultValue={site.email}
              required
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1">
              Address Line 1
            </label>
            <input
              name="addressLine1"
              defaultValue={site.address.line1}
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1">
              City
            </label>
            <input
              name="addressCity"
              defaultValue={site.address.city}
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1">
              Region
            </label>
            <input
              name="addressRegion"
              defaultValue={site.address.region}
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1">
              Postcode
            </label>
            <input
              name="addressPostcode"
              defaultValue={site.address.postcode}
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-white/70 mb-1">
            Companies House Number
          </label>
          <input
            name="companyNo"
            defaultValue={site.companyNo}
            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
          />
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1">
              Facebook URL
            </label>
            <input
              name="facebook"
              defaultValue={site.social.facebook}
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1">
              Instagram URL
            </label>
            <input
              name="instagram"
              defaultValue={site.social.instagram}
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1">
              LinkedIn URL
            </label>
            <input
              name="linkedin"
              defaultValue={site.social.linkedin}
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-white/70 mb-1">
            Homepage Stats — one per line, format:{" "}
            <code className="bg-white/5 px-1 rounded">value | label</code>
          </label>
          <textarea
            name="stats"
            defaultValue={site.stats.map((s) => `${s.value} | ${s.label}`).join("\n")}
            rows={4}
            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-white/70 mb-1">
            &quot;Why Choose Us&quot; Cards — one per line, format:{" "}
            <code className="bg-white/5 px-1 rounded">title | description</code>
          </label>
          <textarea
            name="whyChooseUs"
            defaultValue={site.whyChooseUs
              .map((w) => `${w.title} | ${w.description}`)
              .join("\n")}
            rows={4}
            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all font-mono"
          />
        </div>

        <button
          type="submit"
          className="rounded-lg bg-[#c5eb02] text-black text-sm font-semibold px-6 py-3 hover:bg-[#c5eb02]/80"
        >
          Save Settings
        </button>
      </form>
    </div>
  );
}
