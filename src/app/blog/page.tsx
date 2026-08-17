import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { BlogFilterClient } from "./BlogFilter";
import { withSeoOverride } from "@/lib/seo";
import { getCurrentBlogPosts } from "@/lib/cms";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await withSeoOverride("/blog", {
      title: "Energy Saving & Home Improvement Insights",
      description:
        "Practical advice from Greentek on solar PV, air source heat pumps, insulation, property refurbishment, and energy-efficient living. Get expert tips to reduce your energy bills.",
    })),
    keywords: [
      "energy saving tips",
      "energy efficiency",
      "solar PV installation",
      "air source heat pump",
      "home insulation",
      "property refurbishment",
      "reduce energy bills",
      "energy blog",
      "renewable energy",
      "West Midlands",
      "Wales",
    ],
  };
}

export default async function BlogPage() {
  const posts = await getCurrentBlogPosts();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 ">
        {/* Hero Section - Compact */}
        <section className="relative  bg-[url('/images/footer/footer-bg.webp')] bg-cover overflow-hidden">
          <div className="bg-black/60 pt-30 py-20">
            <div className="absolute top-0 right-0 w-80 h-80 bg-green-500/10 rounded-full blur-3xl" />
            <div className="mx-auto max-w-5xl px-6 text-center relative z-10">
              <h1 className="text-[2rem] md:text-[3.5rem] font-bold leading-[1.15] text-white mb-4">
                Energy Saving &amp;{" "}
                <span className="text-[#c5eb02]">Home Improvement</span> Tips
              </h1>
              <p className="text-[15px] md:text-base text-white/80 max-w-2xl mx-auto leading-relaxed font-normal">
                Expert insights on solar PV, heat pumps, insulation, and
                energy-efficient living for your home.
              </p>
            </div>
          </div>
        </section>

        <BlogFilterClient posts={posts} />
      </main>

      <Footer />
    </div>
  );
}
