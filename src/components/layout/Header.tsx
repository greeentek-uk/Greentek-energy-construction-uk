"use client";
import { hankenGrotesk } from "@/lib/fonts";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/data/site";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    setIsMenuOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  useEffect(() => {
    if (isMenuOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.overflowY = "scroll";

      return () => {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.overflowY = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [isMenuOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <>
      <style>{`
        .backdrop-blur-custom {
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .mobile-menu-transition {
          transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>

      {/* Header Container */}
      <header className="w-full px-8 sticky top-0 left-0 z-[60] flex justify-center bg-black/10 backdrop-blur-3xl border-b border-[#c5eb02]">
        <div className="flex w-full items-center justify-between px-4 py-3 bg-transparent">
          {/* Logo */}
          <Link href="/" className="flex items-center z-[70]">
            <Image
              src="/images/home-page/greentek-logo.png"
              alt="Greentek"
              width={180}
              height={60}
              className="h-8 md:h-10 lg:h-12 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-5">
            {siteConfig.navLinks.map((link) => {
              const hasDropdown =
                link.label === "Services" ||
                link.label === "Projects" ||
                link.label === "Locations";

              return (
                <div
                  key={link.label}
                  className="relative group"
                  onMouseEnter={() => setActiveDropdown(link.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={link.href}
                    className={`${hankenGrotesk.className} flex items-center gap-1 text-[12px] font-extrabold uppercase transition hover:text-[#c5eb02] ${
                      activeDropdown === link.label
                        ? "text-[#c5eb02]"
                        : "text-white"
                    }`}
                  >
                    {link.label}
                    {hasDropdown && (
                      <svg
                        className={`w-3 h-3 transition-transform duration-300 ${
                          activeDropdown === link.label ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    )}
                  </Link>

                  {hasDropdown && (
                    <div
                      className={`absolute top-full left-0 w-64 pt-4 transition-all duration-300 transform ${
                        activeDropdown === link.label
                          ? "opacity-100 translate-y-0 pointer-events-auto"
                          : "opacity-0 -translate-y-2 pointer-events-none"
                      }`}
                    >
                      <div className="bg-[#000000] rounded-2xl shadow-2xl shadow-zinc-900/10 border border-[#c5eb02]/40 p-3 overflow-hidden">
                        {link.label === "Services" ? (
                          <div className="flex flex-col gap-1">
                            {siteConfig.services.map((service) => (
                              <Link
                                key={service.slug}
                                href={`/services/${service.slug}`}
                                className="px-4 py-3 rounded-xl hover:bg-[#c5eb02] transition-colors group/item"
                              >
                                <span className="block text-xs font-bold text-white group-hover/item:text-black transition-colors">
                                  {service.title}
                                </span>
                              </Link>
                            ))}
                          </div>
                        ) : link.label === "Projects" ? (
                          <div className="flex flex-col gap-1">
                            {siteConfig.projects.slice(0, 5).map((project) => (
                              <Link
                                key={project.slug}
                                href={`/projects/${project.slug}`}
                                className="px-4 py-3 rounded-xl hover:bg-[#c5eb02] transition-colors group/item"
                              >
                                <span className="block text-xs font-bold text-white group-hover/item:text-black transition-colors">
                                  {project.title}
                                </span>
                              </Link>
                            ))}
                            <div className="h-px bg-zinc-100 my-1 mx-2" />
                            <Link
                              href="/projects"
                              className="px-4 py-2 text-center text-[10px] font-black uppercase text-[#c5eb02] hover:text-[#c5eb02]/80"
                            >
                              View All Projects
                            </Link>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            {siteConfig.locations.map((location) => (
                              <Link
                                key={location.slug}
                                href={`/locations/${location.slug}`}
                                className="px-4 py-3 rounded-xl hover:bg-[#c5eb02] transition-colors group/item"
                              >
                                <span className="block text-xs font-bold text-white group-hover/item:text-black transition-colors">
                                  {location.name}
                                </span>
                              </Link>
                            ))}
                            <div className="h-px bg-zinc-100 my-1 mx-2" />
                            <Link
                              href="/locations"
                              className="px-4 py-2 text-center text-[10px] font-black uppercase text-[#c5eb02] hover:text-[#c5eb02]/80"
                            >
                              View All Areas
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 lg:gap-6 z-[70]">
            {/* Desktop Phone + Lottie */}
            <Link
              href="tel:03335334567"
              className="hidden lg:flex items-center gap-2 text-white font-medium hover:text-[#c5eb02] transition"
            >
              {/* SVG as plain img (avoids Next.js image issues) */}
              <img
                src="/animations/phone-ring.svg"
                alt="Phone Icon"
                className="w-10 h-10 transition hover:scale-110"
                width={24}
                height={24}
              />
              <span className="text-sm whitespace-nowrap">
                0 333 533 4567
              </span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 min-w-[44px] min-h-[44px] flex flex-col items-center justify-center gap-1.5 focus:outline-none"
              onClick={toggleMenu}
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              <span
                className={`w-6 h-0.5 bg-[#c5eb02] rounded-full transition-all duration-300 transform ${
                  isMenuOpen ? "rotate-45 translate-y-2" : ""
                }`}
              />
              <span
                className={`w-6 h-0.5 bg-[#c5eb02] rounded-full transition-all duration-300 ${
                  isMenuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`w-6 h-0.5 bg-[#c5eb02] rounded-full transition-all duration-300 transform ${
                  isMenuOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay (unchanged) */}
      <div
        className={`fixed inset-0 z-[100] lg:hidden mobile-menu-transition bg-black/85 backdrop-blur-custom overflow-y-auto overscroll-contain ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsMenuOpen(false);
        }}
      >
        <div className="flex flex-col min-h-full bg-transparent w-full">
          {/* Overlay Header */}
          <div className="flex justify-between items-center px-4 pt-4 pb-6">
            <Link
              href="/"
              className="flex items-center z-[70]"
              onClick={() => setIsMenuOpen(false)}
            >
              <Image
                src="/images/home-page/greentek-logo.png"
                alt="Greentek"
                width={180}
                height={60}
                className="h-8 md:h-10 lg:h-12 w-auto object-contain"
                priority
              />
            </Link>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="w-12 h-12 rounded-full border border-white/20 text-white flex items-center justify-center hover:bg-white/10 transition active:scale-90"
              aria-label="Close menu"
            >
              <svg
                className="w-7 h-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Overlay Nav Links */}
          <nav className="flex flex-col px-6 mt-4" role="navigation">
            {siteConfig.navLinks.map((link) => {
              const hasDropdown =
                link.label === "Services" ||
                link.label === "Projects" ||
                link.label === "Locations";
              const isDropdownOpen = openDropdown === link.label;
              const isActive = pathname === link.href;

              return (
                <div
                  key={link.label}
                  className="border-b border-white/10 last:border-0"
                >
                  <div className="flex items-center justify-between py-5">
                    <Link
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`text-sm font-semibold transition-colors ${
                        isActive ? "text-[#c5eb02]" : "text-white"
                      }`}
                    >
                      {link.label.toUpperCase()}
                    </Link>

                    {hasDropdown && (
                      <button
                        onClick={() =>
                          setOpenDropdown(isDropdownOpen ? null : link.label)
                        }
                        className="p-3"
                        aria-expanded={isDropdownOpen}
                      >
                        <svg
                          className={`w-6 h-6 text-white transition-transform duration-300 ${
                            isDropdownOpen ? "rotate-180" : ""
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Dropdown Content */}
                  {hasDropdown && (
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isDropdownOpen ? "max-h-96 pb-6" : "max-h-0"
                      }`}
                    >
                      <div className="pl-5 border-l border-[#c5eb02]/50 ml-2 flex flex-col gap-4">
                        {link.label === "Services"
                          ? siteConfig.services.map((service) => (
                              <Link
                                key={service.slug}
                                href={`/services/${service.slug}`}
                                onClick={() => setIsMenuOpen(false)}
                                className="text-base text-white/60 hover:text-white transition-colors"
                              >
                                {service.title}
                              </Link>
                            ))
                          : link.label === "Projects"
                            ? siteConfig.projects.slice(0, 5).map((project) => (
                                <Link
                                  key={project.slug}
                                  href={`/projects/${project.slug}`}
                                  onClick={() => setIsMenuOpen(false)}
                                  className="text-base text-white/60 hover:text-white transition-colors"
                                >
                                  {project.title}
                                </Link>
                              ))
                            : siteConfig.locations.map((location) => (
                                <Link
                                  key={location.slug}
                                  href={`/locations/${location.slug}`}
                                  onClick={() => setIsMenuOpen(false)}
                                  className="text-base text-white/60 hover:text-white transition-colors"
                                >
                                  {location.name}
                                </Link>
                              ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Overlay Bottom CTA */}
          <div className="mt-auto px-6 pb-12">
            <Link
              href="/contact"
              onClick={() => setIsMenuOpen(false)}
              className="block w-full py-5 bg-[#c5eb02] text-black font-black text-sm rounded-full text-center active:scale-95 transition shadow-2xl shadow-[#c5eb02]/40"
            >
              Start Project
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
