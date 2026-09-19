import type { FooterCta, FooterCtaButton } from "@/lib/footerCta";
import { saveFooterCtaAction } from "../_actions/footerCta";

const input =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#c5eb02] focus:ring-2 focus:ring-[#c5eb02]/20 transition-all";
const label = "block text-xs font-semibold text-white/70 mb-1";

function ButtonFields({
  prefix,
  title,
  button,
}: {
  prefix: "primary" | "secondary";
  title: string;
  button: FooterCtaButton;
}) {
  return (
    <fieldset className="rounded-lg border border-white/10 p-3 space-y-3">
      <legend className="px-1 text-xs font-bold text-white">{title}</legend>
      <label className="flex items-center gap-2 text-sm text-white/80">
        <input
          type="checkbox"
          name={`${prefix}Show`}
          defaultChecked={button.show}
          className="accent-[#c5eb02]"
        />
        Show this button
      </label>
      <div>
        <label className={label}>Button text</label>
        <input name={`${prefix}Label`} defaultValue={button.label} className={input} />
      </div>
      <div>
        <label className={label}>Links to</label>
        <select name={`${prefix}LinkType`} defaultValue={button.linkType} className={input}>
          <option value="url" className="text-black">A page or URL (enter below)</option>
          <option value="whatsapp" className="text-black">WhatsApp chat (company phone)</option>
          <option value="call" className="text-black">Phone call (company phone)</option>
        </select>
      </div>
      <div>
        <label className={label}>Page or URL (only used for &ldquo;A page or URL&rdquo;)</label>
        <input
          name={`${prefix}Href`}
          defaultValue={button.href}
          placeholder="/contact or https://…"
          className={input}
        />
      </div>
    </fieldset>
  );
}

/**
 * Edits one footer CTA — the site-wide default or a page override. `target` is
 * "default", the override's current path, or "" for a new override.
 */
export default function FooterCtaForm({
  target,
  path,
  cta,
  submitLabel = "Save",
}: {
  target: string;
  path?: string;
  cta: FooterCta;
  submitLabel?: string;
}) {
  const isDefault = target === "default";

  return (
    <form action={saveFooterCtaAction} className="space-y-4">
      <input type="hidden" name="target" value={target} />

      {!isDefault && (
        <div>
          <label className={label}>Page path</label>
          <input
            name="path"
            defaultValue={path}
            required
            list="footer-cta-paths"
            placeholder="/finance  ·  /services/*  ·  /locations/cardiff/*"
            className={input}
          />
          <p className="text-xs text-white/50 mt-1">
            An exact page, or end with <code>{"/*"}</code> to cover every page under it.
            The most specific match wins.
          </p>
        </div>
      )}

      <div>
        <label className={label}>Small label above the heading</label>
        <input name="eyebrow" defaultValue={cta.eyebrow} className={input} />
      </div>
      <div>
        <label className={label}>Heading (press Enter for a line break)</label>
        <textarea name="heading" defaultValue={cta.heading} rows={2} className={input} />
      </div>
      <div>
        <label className={label}>Text</label>
        <textarea name="body" defaultValue={cta.body} rows={3} className={input} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <ButtonFields prefix="primary" title="First button (lime)" button={cta.primary} />
        <ButtonFields prefix="secondary" title="Second button (white)" button={cta.secondary} />
      </div>

      <button
        type="submit"
        className="rounded-lg bg-[#c5eb02] text-black text-sm font-semibold px-5 py-2.5 hover:bg-[#c5eb02]/80"
      >
        {submitLabel}
      </button>
    </form>
  );
}
