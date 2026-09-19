"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import {
  footerCtaHref,
  resolveFooterCta,
  type FooterCtaButton,
  type FooterCtaSettings,
} from "@/lib/footerCta";

const buttonClass =
  "w-fit rounded px-4 py-3 text-sm md:text-[18px] font-semibold text-black backdrop-blur-sm transition active:scale-95";

function CtaButton({
  button,
  phone,
  colour,
}: {
  button: FooterCtaButton;
  phone: string;
  colour: string;
}) {
  if (!button.show || !button.label.trim()) return null;
  const { href, external } = footerCtaHref(button, phone);
  const content = (
    <>
      {button.label}{" "}
      <ArrowRight className="inline ml-2 bg-black rounded px-1 py-1 text-white" />
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${button.label} (opens in a new tab)`}
        className={`${buttonClass} ${colour}`}
      >
        {content}
      </a>
    );
  }
  if (href.startsWith("tel:")) {
    return (
      <a href={href} className={`${buttonClass} ${colour}`}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={`${buttonClass} ${colour}`}>
      {content}
    </Link>
  );
}

/**
 * The footer's call to action, chosen for the page being viewed.
 *
 * Resolved in the browser from the URL rather than on the server: the footer
 * is on every one of the site's statically generated pages, and reading the
 * request path on the server would force all of them to render per request.
 * The server passes every override down, and this picks the one that applies.
 */
export default function FooterCta({
  settings,
  phone,
}: {
  settings: FooterCtaSettings;
  phone: string;
}) {
  const pathname = usePathname() ?? "/";
  const cta = resolveFooterCta(pathname, settings);
  const headingLines = cta.heading.split("\n");

  return (
    <div className="mx-auto w-full flex flex-col items-center justify-center">
      {cta.eyebrow && (
        <p className="text-[10px] md:text-[16px] font-semibold uppercase mb-6 bg-[#28282C] text-[#c5eb02] rounded-2xl px-3 py-1 w-fit mx-auto">
          {cta.eyebrow}
        </p>
      )}
      {cta.heading && (
        <h2 className="text-white text-[1.8rem] md:text-[2.8rem] font-bold leading-[1.15] max-w-[90%] sm:max-w-lg md:max-w-2xl text-center px-4">
          {headingLines.map((line, i) => (
            <Fragment key={i}>
              {i > 0 && <br />}
              {line}
            </Fragment>
          ))}
        </h2>
      )}
      {cta.body && (
        <p className="mt-4 text-lg md:text-xl text-white/80 leading-relaxed text-center max-w-[90%] sm:max-w-md mx-auto font-normal">
          {cta.body}
        </p>
      )}
      <div className="mt-12 mb-12 flex flex-wrap items-center justify-center gap-3 px-4">
        <CtaButton button={cta.primary} phone={phone} colour="bg-[#c5eb02]" />
        <CtaButton button={cta.secondary} phone={phone} colour="bg-white" />
      </div>
    </div>
  );
}
