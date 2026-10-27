import Link from "@/components/ui/Link";
import CookieSettingsButton from "@/components/site/CookieSettingsButton";
import Image from "next/image";
import { getCurrentSiteConfig, getPageContent } from "@/lib/cms";
import { FINANCE_PROVIDERS, paragraphs } from "@/lib/financeProviders";
import { getFooterCtaSettings } from "@/lib/db/footerCta";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { whatsappUrl } from "@/lib/whatsapp";
import FooterCta from "./FooterCta";

const heading =
  "mb-5 text-xs font-bold uppercase tracking-[0.14em] text-[#c5eb02]";
const link = "text-sm text-white/70 hover:text-white transition-colors";
const icon = "mt-0.5 h-[18px] w-[18px] shrink-0 text-[#c5eb02]";
const FACEBOOK =
  "M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z";
const INSTAGRAM =
  "M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16.4a4.4 4.4 0 110-8.8 4.4 4.4 0 010 8.8zm6.487-11.59a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z";
const LINKEDIN =
  "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z";

export default async function Footer({
  hideCta = false,
}: { hideCta?: boolean } = {}) {
  const [siteConfig, footerCta, financeProviders] = await Promise.all([
    getCurrentSiteConfig(),
    getFooterCtaSettings(),
    Promise.all(FINANCE_PROVIDERS.map((p) => getPageContent(p.block))),
  ]);
  const currentYear = new Date().getFullYear();
  const tel = `tel:${siteConfig.phone.replace(/[^\d+]/g, "")}`;
  const socials = [
    { label: "Facebook", href: siteConfig.social.facebook, path: FACEBOOK },
    { label: "Instagram", href: siteConfig.social.instagram, path: INSTAGRAM },
    { label: "LinkedIn", href: siteConfig.social.linkedin, path: LINKEDIN },
  ].filter((s) => s.href);

  return (
    <footer>
      {!hideCta && (
        <section className="bg-[url('/images/footer/footer-bg.webp')] bg-cover bg-center">
          <div className="bg-black/65 pt-16 md:pt-20 pb-4">
            <FooterCta settings={footerCta} phone={siteConfig.phone} />
          </div>
        </section>
      )}

      <div className="bg-[#0b0d0e] border-t-2 border-[#c5eb02] text-white">
        <div className="site-container pt-14 pb-8 md:pt-16">
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-12 lg:gap-x-10">
            <div className="col-span-2 lg:col-span-4">
              <Link href="/" className="inline-block">
                <Image
                  src="/images/home-page/greentek-logo.png"
                  sizes="200px"
                  alt={siteConfig.name}
                  width={200}
                  height={66}
                  className="h-12 w-auto object-contain"
                />
              </Link>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/65">
                One team for construction and renewable energy, solar, heat
                pumps, insulation and full renovations, across the UK.
              </p>
              {socials.length > 0 && (
                <ul className="mt-6 flex gap-2.5">
                  {socials.map((social) => (
                    <li key={social.label}>
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label}
                        className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.06] text-white/80 transition-colors hover:bg-[#c5eb02] hover:text-black"
                      >
                        <svg
                          className="h-[18px] w-[18px]"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d={social.path}
                          />
                        </svg>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <nav aria-label="Services" className="lg:col-span-3">
              <h2 className={heading}>Services</h2>
              <ul className="space-y-2.5">
                {siteConfig.services.map((service) => (
                  <li key={service.slug}>
                    <Link href={`/services/${service.slug}`} className={link}>
                      {service.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Company" className="lg:col-span-2">
              <h2 className={heading}>Company</h2>
              <ul className="space-y-2.5">
                {siteConfig.navLinks.map((navLink) => (
                  <li key={navLink.label}>
                    <Link href={navLink.href} className={link}>
                      {navLink.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="col-span-2 sm:col-span-1 lg:col-span-3">
              <h2 className={heading}>Get in touch</h2>
              <ul className="space-y-4 text-sm">
                <li>
                  <a href={tel} className="group flex items-start gap-3">
                    <Phone className={icon} aria-hidden />
                    <span>
                      <span className="block text-base font-semibold text-white group-hover:text-[#c5eb02] transition-colors">
                        {siteConfig.phone}
                      </span>
                      <span className="text-white/50">
                        Call for a free quote
                      </span>
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href={whatsappUrl(siteConfig.phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-white/70 hover:text-[#c5eb02] transition-colors"
                  >
                    <MessageCircle className={icon} aria-hidden />
                    Message us on WhatsApp
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="flex items-center gap-3 text-white/70 hover:text-[#c5eb02] transition-colors break-all"
                  >
                    <Mail className={icon} aria-hidden />
                    {siteConfig.email}
                  </a>
                </li>
                <li className="flex items-start gap-3 text-white/70">
                  <MapPin className={icon} aria-hidden />
                  <address className="not-italic leading-relaxed">
                    {siteConfig.address.line1}
                    <br />
                    {siteConfig.address.city}, {siteConfig.address.postcode}
                  </address>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 grid gap-6 border-t border-white/10 pt-8 md:grid-cols-2 md:gap-10">
            {financeProviders.map((provider, i) => (
              <div key={FINANCE_PROVIDERS[i].slug} className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
                  Finance — {provider.name}
                </p>
                {paragraphs(provider.disclosure).map((p) => (
                  <p key={p} className="text-xs leading-relaxed text-white/50">
                    {p}
                  </p>
                ))}
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/50 md:flex-row md:items-center md:justify-between">
            <p>
              © {currentYear} {siteConfig.name}. Company No.{" "}
              {siteConfig.companyNo}, registered in England.
            </p>
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {siteConfig.footerLinks.map((footerLink) => (
                <li key={footerLink.href}>
                  <Link
                    href={footerLink.href}
                    {...(footerLink.newTab
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="hover:text-[#c5eb02] transition-colors"
                  >
                    {footerLink.label}
                  </Link>
                </li>
              ))}
              <li>
                <CookieSettingsButton className="hover:text-[#c5eb02] transition-colors" />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
