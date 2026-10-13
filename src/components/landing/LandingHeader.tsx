import Image from "next/image";
import { Phone } from "lucide-react";

export default function LandingHeader({
  phone,
  offer,
  quoteLabel,
}: {
  phone: string;
  offer: string;
  quoteLabel: string;
}) {
  const tel = `tel:${phone.replace(/[^\d+]/g, "")}`;
  return (
    <>
      {offer && (
        <div className="bg-[#c5eb02] text-black">
          <p className="site-container py-2 text-center text-[13px] font-semibold leading-snug md:text-sm">
            {offer}{" "}
            <a href={tel} className="whitespace-nowrap underline underline-offset-2">
              Call {phone}
            </a>
          </p>
        </div>
      )}
      <header className="sticky top-0 z-[60] w-full bg-black">
        <div className="site-container flex items-center justify-between gap-4 py-3">
          <Image
            src="/images/home-page/greentek-logo.png"
            sizes="180px"
            alt="Greentek"
            width={180}
            height={50}
            className="h-9 md:h-11 w-auto object-contain"
            priority
          />
          <div className="flex items-center gap-3">
            <a
              href={tel}
              className="inline-flex items-center gap-2 rounded-lg border border-white/25 px-3.5 py-2.5 text-sm font-bold text-white transition hover:border-[#c5eb02] hover:text-[#c5eb02]"
            >
              <Phone className="h-4 w-4" aria-hidden />
              <span className="whitespace-nowrap">{phone}</span>
            </a>
            <a
              href="#quote"
              data-quote
              className="hidden sm:inline-flex rounded-lg bg-[#c5eb02] px-5 py-2.5 text-sm font-extrabold uppercase tracking-wide text-black transition hover:bg-[#d4f53a]"
            >
              {quoteLabel}
            </a>
          </div>
        </div>
      </header>
    </>
  );
}
