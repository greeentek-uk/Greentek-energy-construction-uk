import { getImageDelivery } from "@/lib/db/imageDelivery";
import { QUALITY_OPTIONS, setImageDeliveryConfig } from "@/lib/imageDelivery";
import cloudinaryLoader from "@/lib/imageLoader";
import { saveImageDeliveryAction } from "../../_actions/imageSettings";
import SaveBanner from "../../_components/SaveBanner";

interface Props {
  searchParams: Promise<{ saved?: string; error?: string }>;
}

const SAMPLE_SRC =
  "https://res.cloudinary.com/demo/image/upload/v1234567890/greentek/example.jpg";

export default async function ImageDeliveryPage({ searchParams }: Props) {
  const [params, config] = await Promise.all([searchParams, getImageDelivery()]);

  // The loader reads its config from the module singleton the public layout
  // normally populates; the admin layout never renders that, so prime it here
  // to preview what the live site is actually requesting today.
  setImageDeliveryConfig(config);
  const previewUrl = cloudinaryLoader({ src: SAMPLE_SRC, width: 1080 });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Image Delivery</h1>
      <p className="text-white/50 mb-6 text-sm">
        Uploaded images are served straight from Cloudinary, which converts them to AVIF or
        WebP on the fly and resizes each one to the space it actually occupies on the page —
        a logo is fetched at logo size, not at screen size. These settings control how hard
        it compresses. The defaults are already right for most sites; only change them if
        pages feel heavy or an image looks soft.
      </p>

      <SaveBanner saved={params.saved === "1"} error={params.error} />

      <form
        action={saveImageDeliveryAction}
        className="space-y-6 bg-[#101314] border border-white/10 rounded-xl p-6"
      >
        <div>
          <label className="block text-xs font-semibold text-white/70 mb-1">Quality</label>
          <select
            name="quality"
            defaultValue={config.quality}
            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
          >
            {QUALITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-white/40 mt-1">
            Auto lets Cloudinary judge each image individually — it usually beats any fixed
            number on both size and appearance.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-white/70 mb-1">
            Upper size limit (px)
          </label>
          <input
            name="maxWidth"
            type="number"
            min={640}
            max={5000}
            step={10}
            defaultValue={config.maxWidth}
            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all"
          />
          <p className="text-xs text-white/40 mt-1">
            A safety ceiling only. Each image is already requested at the width of the slot
            it sits in — this just stops a genuinely full-width one, like the homepage hero,
            from being fetched larger than this on a very big monitor.
          </p>
        </div>

        <label className="flex items-start gap-2 text-sm text-white/70">
          <input
            type="checkbox"
            name="autoFormat"
            defaultChecked={config.autoFormat}
            className="accent-[#c5eb02] mt-1"
          />
          <span>
            Automatic format (AVIF / WebP)
            <span className="block text-xs text-white/40">
              Serves each browser the smallest format it supports. Leave this on.
            </span>
          </span>
        </label>

        <label className="flex items-start gap-2 text-sm text-white/70">
          <input
            type="checkbox"
            name="dprAuto"
            defaultChecked={config.dprAuto}
            className="accent-[#c5eb02] mt-1"
          />
          <span>
            Device pixel ratio detection
            <span className="block text-xs text-white/40">
              Only works if Client Hints are enabled on your Cloudinary delivery domain.
              Off by default — the site already serves retina sizes through srcset.
            </span>
          </span>
        </label>

        <button
          type="submit"
          className="rounded-lg bg-[#c5eb02] text-black text-sm font-semibold px-6 py-3 hover:bg-[#c5eb02]/80"
        >
          Save Image Settings
        </button>
      </form>

      <div className="mt-6 bg-[#101314] border border-white/10 rounded-xl p-6">
        <h2 className="font-bold text-white mb-1">What gets requested</h2>
        <p className="text-white/50 text-sm mb-3">
          An image sitting in a 1080px-wide slot is currently fetched as:
        </p>
        <pre className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white/60 font-mono overflow-x-auto whitespace-pre-wrap">
          {previewUrl}
        </pre>
        <p className="text-xs text-white/40 mt-3">
          The <code className="bg-white/5 px-1 rounded">w_</code> value comes from how wide
          the image renders in its layout, so a brand logo asks for around 112px while a
          full-bleed hero asks for the viewport width. Images stored outside Cloudinary —
          the logo and icons in <code className="bg-white/5 px-1 rounded">/images</code> —
          are optimised by the site itself and aren&apos;t affected by these settings.
        </p>
      </div>
    </div>
  );
}
