import Image from "next/image";
import { ArrowRight, ShieldAlert } from "lucide-react";
import Link from "@/components/ui/Link";
import type { FinanceProviderContent } from "@/data/pageContent";
import { paragraphs } from "@/lib/financeProviders";

/**
 * Pieces shared by /finance and the provider pages. Every provider goes
 * through the same components, so they're presented equally — same card, same
 * risk box, same disclosure treatment.
 */

/** Internal links stay in the tab; anything else opens a new one. */
export function ActionLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: React.ReactNode;
}) {
  if (/^https?:\/\//i.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export const primaryButton =
  "inline-flex items-center justify-center gap-2 px-6 md:px-8 py-4 rounded-full bg-[#c5eb02] text-black text-sm font-bold hover:bg-[#c5eb02]/80 transition-all";
export const secondaryButton =
  "inline-flex items-center justify-center gap-2 px-6 md:px-8 py-4 rounded-full border border-white/30 text-white text-sm font-bold hover:border-[#c5eb02] hover:text-[#c5eb02] transition-all";

/** `priority` for a logo at the top of a page, so it isn't lazy-loaded after first paint. */
export function ProviderLogo({
  provider,
  className,
  priority,
}: {
  provider: FinanceProviderContent;
  className: string;
  priority?: boolean;
}) {
  if (!provider.logo) return <p className="text-2xl font-bold text-white">{provider.name}</p>;
  return (
    <Image
      src={provider.logo}
      alt={provider.logoAlt || provider.name}
      width={400}
      height={160}
      sizes="240px"
      priority={priority}
      className={`w-auto object-contain ${className}`}
    />
  );
}

/** The risk warning box: same wording rules and look for every provider. */
export function RiskWarning({ text }: { text: string }) {
  const paras = paragraphs(text);
  if (!paras.length) return null;
  return (
    <div className="flex gap-4 rounded-xl bg-white/5 border border-white/10 px-6 py-5">
      <ShieldAlert className="h-6 w-6 flex-shrink-0 text-[#c5eb02]" aria-hidden />
      <div className="space-y-2">
        {paras.map((p) => (
          <p key={p} className="text-white/70 text-sm leading-relaxed">
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}

/** The mandatory statement, verbatim, as plain text. */
export function Disclosure({ text }: { text: string }) {
  const paras = paragraphs(text);
  if (!paras.length) return null;
  return (
    <div className="space-y-2">
      {paras.map((p) => (
        <p key={p} className="text-white/55 text-xs leading-relaxed">
          {p}
        </p>
      ))}
    </div>
  );
}

/** A provider's card on /finance — both cards identical in structure and size. */
export function ProviderCard({ provider, href }: { provider: FinanceProviderContent; href: string }) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-white/10 bg-[#101314] p-6 md:p-8">
      <div className="flex h-16 items-center">
        <ProviderLogo provider={provider} className="h-12 md:h-14" />
      </div>
      <h2 className="mt-5 text-xl md:text-2xl font-bold text-white">{provider.name}</h2>
      <p className="mt-3 text-white/70 leading-relaxed">{provider.intro}</p>
      {provider.features.length > 0 && (
        <ul className="mt-5 space-y-2">
          {provider.features.map((f) => (
            <li key={f} className="flex gap-2 text-sm text-white/80">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c5eb02]" aria-hidden />
              {f}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-6">
        <Link href={href} className={primaryButton}>
          Finance with {provider.name}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="mt-auto space-y-4 border-t border-white/10 pt-6 mt-8">
        <RiskWarning text={provider.riskWarning} />
        <Disclosure text={provider.disclosure} />
      </div>
    </article>
  );
}
