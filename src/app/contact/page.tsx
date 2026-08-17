import type { Metadata } from "next";
import { withSeoOverride } from "@/lib/seo";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ContactPageClient from "./ContactPageClient";

export async function generateMetadata(): Promise<Metadata> {
  return withSeoOverride("/contact", {
    title: "Contact Us",
    description:
      "Get in touch with Greentek for a free quote on solar PV, heating, insulation, or renovation work across the West Midlands and Wales.",
  });
}

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <ContactPageClient />
      <Footer />
    </div>
  );
}
