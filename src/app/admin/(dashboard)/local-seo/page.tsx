import { getCurrentSiteConfig } from "@/lib/cms";
import { saveLocalSeoAction } from "../../_actions/localSeo";
import SaveBanner from "../../_components/SaveBanner";

interface Props {
  searchParams: Promise<{ saved?: string; error?: string }>;
}

const input =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all";

/** schema.org types that fit a construction and renewables contractor. */
const BUSINESS_TYPES = [
  { value: "LocalBusiness", label: "Local Business (generic)" },
  { value: "HomeAndConstructionBusiness", label: "Home & Construction Business" },
  { value: "GeneralContractor", label: "General Contractor" },
  { value: "RoofingContractor", label: "Roofing Contractor" },
  { value: "HVACBusiness", label: "HVAC Business" },
  { value: "Electrician", label: "Electrician" },
  { value: "Plumber", label: "Plumber" },
];

const DEFAULT_HOURS = [
  { days: "Monday, Tuesday, Wednesday, Thursday, Friday", opens: "08:00", closes: "17:00", closed: false },
  { days: "Saturday", opens: "09:00", closes: "13:00", closed: false },
  { days: "Sunday", opens: "", closes: "", closed: true },
];

export default async function LocalSeoPage({ searchParams }: Props) {
  const [params, site] = await Promise.all([searchParams, getCurrentSiteConfig()]);
  const local = site.localSeo;
  const hours = local?.openingHours?.length ? local.openingHours : DEFAULT_HOURS;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Local SEO</h1>
      <p className="text-white/50 mb-6 text-sm">
        Feeds the LocalBusiness structured data on every page — the details Google uses for
        the local pack and map results. Your address and phone are edited in{" "}
        <span className="text-white/70">Company Settings</span>.
      </p>

      <SaveBanner saved={params.saved === "1"} error={params.error} />

      <form action={saveLocalSeoAction} className="space-y-6">
        <div className="bg-[#101314] border border-white/10 rounded-xl p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">
                Business type
              </label>
              <select
                name="businessType"
                defaultValue={local?.businessType || "LocalBusiness"}
                className={input}
              >
                {BUSINESS_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-white/40 mt-1">
                A more specific type than &ldquo;Local Business&rdquo; generally describes
                you better to search engines.
              </p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">
                Price range
              </label>
              <input
                name="priceRange"
                defaultValue={local?.priceRange ?? ""}
                placeholder="££"
                className={input}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1">
              Service area
            </label>
            <input
              name="serviceArea"
              defaultValue={local?.serviceArea ?? ""}
              placeholder="Within 40 miles of Solihull"
              className={input}
            />
            <p className="text-xs text-white/40 mt-1">
              Your named locations are already listed as areas served — this adds a
              plain-English radius alongside them.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">
                Latitude
              </label>
              <input
                name="latitude"
                defaultValue={local?.latitude ?? ""}
                placeholder="52.4128"
                className={input}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">
                Longitude
              </label>
              <input
                name="longitude"
                defaultValue={local?.longitude ?? ""}
                placeholder="-1.7783"
                className={input}
              />
            </div>
          </div>
          <p className="text-xs text-white/40">
            Both are needed for map coordinates to be published; either one alone is
            ignored.
          </p>
        </div>

        <div className="bg-[#101314] border border-white/10 rounded-xl p-6">
          <h2 className="font-bold text-white mb-1">Opening hours</h2>
          <p className="text-white/50 text-sm mb-4">
            Day names comma-separated, exactly as written: Monday, Tuesday, and so on.
          </p>

          <div className="space-y-3">
            <div className="hidden sm:grid sm:grid-cols-[2fr_1fr_1fr_auto] gap-2 px-1">
              <span className="text-xs font-semibold text-white/50">Days</span>
              <span className="text-xs font-semibold text-white/50">Opens</span>
              <span className="text-xs font-semibold text-white/50">Closes</span>
              <span className="text-xs font-semibold text-white/50">Closed</span>
            </div>
            {hours.map((row, index) => (
              <div
                key={index}
                className="grid sm:grid-cols-[2fr_1fr_1fr_auto] gap-2 items-center"
              >
                <input
                  name="hours_days"
                  defaultValue={row.days}
                  placeholder="Monday, Tuesday"
                  className={input}
                />
                <input
                  name="hours_opens"
                  type="time"
                  defaultValue={row.opens}
                  className={input}
                />
                <input
                  name="hours_closes"
                  type="time"
                  defaultValue={row.closes}
                  className={input}
                />
                <label className="flex items-center gap-2 text-sm text-white/70 px-2">
                  <input
                    type="checkbox"
                    name="hours_closed"
                    defaultChecked={row.closed}
                    className="accent-[#c5eb02]"
                  />
                  <span className="sm:hidden">Closed</span>
                </label>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/40 mt-3">
            Leave a row&apos;s days blank to drop it. Rows are fixed at three — the days
            field takes a list, so one row can cover a whole working week.
          </p>
        </div>

        <button
          type="submit"
          className="rounded-lg bg-[#c5eb02] text-black text-sm font-semibold px-6 py-3 hover:bg-[#c5eb02]/80"
        >
          Save Local SEO
        </button>
      </form>
    </div>
  );
}
