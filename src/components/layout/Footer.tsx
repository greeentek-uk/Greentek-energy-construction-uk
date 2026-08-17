import Link from "next/link";
import Image from "next/image";
import { getCurrentSiteConfig } from "@/lib/cms";
import { ArrowRight } from "lucide-react";

export default async function Footer() {
  const siteConfig = await getCurrentSiteConfig();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[url('/images/footer/footer-bg.webp')] bg-cover bg-center border-t border-zinc-900">
      <div className="bg-black/60 pt-18">
        <div className="mx-auto w-full flex flex-col items-center justify-center">
          <p className="text-[10px] md:text-[16px] font-semibold uppercase mb-6 bg-[#28282C] text-[#c5eb02] rounded-2xl px-3 py-1 w-fit mx-auto">
            Get In Touch
          </p>
          <h2 className="text-white text-[1.8rem] md:text-[2.8rem] font-bold leading-[1.15] max-w-[90%] sm:max-w-lg md:max-w-2xl text-center px-4">
            Ready to Switch to Solar <br /> and Save for Years?
          </h2>
          <p className="mt-4 text-lg md:text-xl text-white/80 leading-relaxed text-center max-w-[90%] sm:max-w-md mx-auto font-normal">
            Join thousands of happy customers who are already enjoying clean
            energy and significant savings. Get your free consultation today.
          </p>
          <div className="mt-12 mb-12">
            <a
              href="/contact"
              className="w-fit rounded px-4 py-3 text-sm md:text-[18px] font-semibold text-black backdrop-blur-sm transition active:scale-95 bg-[#c5eb02]"
            >
              Consult an Expert{" "}
              <ArrowRight className="inline ml-2 bg-black rounded px-1 py-1 text-white" />
            </a>
          </div>
        </div>
        <div className="mx-auto max-w-7xl">
          {/* FOOTER CARD — one responsive layout for mobile & desktop */}
          <div className="mx-4 sm:mx-6 lg:mx-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 px-6 py-10 md:py-12 bg-black/50 backdrop-blur-sm border border-white/50 rounded-xl text-white ">
            {/* Column 1 — Brand */}
            <div className="space-y-4 flex items-center justify-center flex-col text-center">
              <Link href="/" className="inline-block">
                <div className="relative h-16 w-56">
                  <Image
                    src="/images/home-page/greentek-logo.png"
                    alt={siteConfig.name}
                    fill
                    className="object-contain object-left"
                    priority
                  />
                </div>
              </Link>
              <p className="text-sm text-white/90 leading-relaxed text-center max-w-sm">
                Agile multi-disciplinary construction and energy firm
                specializing in sustainable building solutions.
              </p>
            </div>

            {/* Column 2 — Navigation */}
            <div className="space-y-4 flex items-center  flex-col text-center">
              <h4 className="text-lg font-bold text-white mb-4">
                Navigation
              </h4>
              <ul className="space-y-3">
                {siteConfig.navLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/90 hover:text-[#c5eb02] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3 — Contact */}
            <div className="space-y-4 flex items-center flex-col text-center">
              <h4 className="text-lg font-bold text-white mb-4">Contact</h4>
              <ul className="space-y-3 text-sm text-white/90">
                <li>
                  <span className="block text-white/90 text-xs mb-0.5">
                    Phone
                  </span>
                  <a
                    href={`tel:${siteConfig.phone}`}
                    className="hover:text-[#c5eb02] transition-colors"
                  >
                    {siteConfig.phone}
                  </a>
                </li>
                <li>
                  <span className="block text-white/90 text-xs mb-0.5">
                    Email
                  </span>
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="hover:text-[#c5eb02] transition-colors"
                  >
                    {siteConfig.email}
                  </a>
                </li>
                <li>
                  <span className="block text-white/90 text-xs mb-0.5">
                    Address
                  </span>
                  <address className="not-italic leading-relaxed">
                    {siteConfig.address.line1}
                    <br />
                    {siteConfig.address.city}, {siteConfig.address.postcode}
                  </address>
                </li>
              </ul>
            </div>

            {/* Column 4 — Legal / Company */}
            <div className="space-y-6 flex items-center flex-col text-center">
              <div>
                <h4 className="text-lg font-bold text-white mb-4">
                  Company
                </h4>
                <p className="text-sm text-white/90 leading-relaxed">
                  Company No: {siteConfig.companyNo}
                  <br />
                  Registered in England
                </p>
              </div>
              <div className="flex gap-5">
                <a
                  href={siteConfig.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/90 hover:text-[#c5eb02] transition-colors"
                  aria-label="Facebook"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>
                <a
                  href={siteConfig.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/90 hover:text-[#c5eb02] transition-colors"
                  aria-label="Instagram"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16.4a4.4 4.4 0 110-8.8 4.4 4.4 0 010 8.8zm6.487-11.59a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href={siteConfig.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/90 hover:text-[#c5eb02] transition-colors"
                  aria-label="LinkedIn"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mx-4 sm:mx-6 lg:mx-6 border-t border-zinc-900 pt-4 pb-6 text-center flex flex-col items-center gap-2">
            <p className="text-sm md:text-md text-white/90">
              © {currentYear} {siteConfig.name}. All rights reserved.
            </p>
            <div className="flex gap-2">
              <Link
                href="/privacy"
                className="text-xs text-[#c5eb02] transition-colors"
              >
                Privacy Policy
              </Link>
              <span className="text-gray-600 text-xs">·</span>
              <Link
                href="/terms"
                className=" text-xs text-[#c5eb02] transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
