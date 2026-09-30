import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BlogListing from "./BlogListing";
import BlogHero from "./BlogHero";
import CtaSection from "@/components/sections/CtaSection";
import { getBlogCategories } from "@/lib/blogCategories";
import { withSeoOverride } from "@/lib/seo";
import { getCurrentBlogPosts } from "@/lib/cms";
import PageSchema from "@/components/site/PageSchema";

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
      <PageSchema path="/blog" />
      <Header />

      <main className="flex-1 ">
        <BlogHero
          title={
            <>
              Energy Saving &amp; <span className="text-[#c5eb02]">Home Improvement</span> Tips
            </>
          }
          intro="Expert insights on solar PV, heat pumps, insulation, and energy-efficient living for your home."
        />

        <BlogListing
          posts={posts}
          categories={getBlogCategories(posts)}
          totalPosts={posts.length}
          title="Latest articles"
        />

        {/* Replaces the old "Follow on Instagram" block: a reader who has
            just read up on an upgrade is best offered a quote, not a feed. */}
        <div id="quote">
          <CtaSection eyebrow="Free Quote" heading="Ready to Start Your Project?" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
