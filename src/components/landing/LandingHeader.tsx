import Image from "next/image";
import { Phone } from "lucide-react";

/**
 * The ad landing pages' header: the logo and a phone number, nothing else.
 *
 * No menu on purpose. Someone who arrived from an ad has one decision to make,
 * and every link out (Services, Blog, About…) is a way to leave without
 * deciding. The logo isn't a link for the same reason. The phone stays,
 * because a call is as good a conversion as a form.
 */
export default function LandingHeader({ phone, callLabel }: { phone: string; callLabel: string }) {
  return (
    <header className="w-full sticky top-0 left-0 z-[60] flex justify-center bg-black/80 backdrop-blur-xl border-b border-[#c5eb02]">
      <div className="site-container flex items-center justify-between gap-4 py-3">
        <Image
          src="/images/home-page/greentek-logo.png"
          sizes="180px"
          alt="Greentek"
          width={180}
          height={60}
          className="h-8 md:h-10 w-auto object-contain"
          priority
        />
        <a
          href={`tel:${phone.replace(/[^\d+]/g, "")}`}
          className="inline-flex items-center gap-2 rounded-full bg-[#c5eb02] px-4 py-2.5 text-sm font-bold text-black transition active:scale-95 hover:bg-[#c5eb02]/90"
        >
          <Phone className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">{callLabel}</span>
          <span className="whitespace-nowrap">{phone}</span>
        </a>
      </div>
    </header>
  );
}
