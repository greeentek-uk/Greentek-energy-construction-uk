import { Hanken_Grotesk, Inter } from "next/font/google";

// Heading / display font — used for h1–h6 and other brand-forward UI (nav, big CTAs).
export const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken-grotesk",
  display: "swap",
});

// Body font — used for paragraphs, buttons, forms, and everything else.
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
