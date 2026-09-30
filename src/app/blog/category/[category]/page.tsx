import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CtaSection from "@/components/sections/CtaSection";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import PageSchema from "@/components/site/PageSchema";
import { getCurrentBlogPosts } from "@/lib/cms";
import { withSeoOverride } from "@/lib/seo";
import { getBlogCategories, postsInCategory } from "@/lib/blogCategories";
import BlogListing from "../../BlogListing";
import BlogHero from "../../BlogHero";

interface Props {
  params: Promise<{ category: string }>;
}

async function load(slug: string) {
  const posts = await getCurrentBlogPosts();
  const categories = getBlogCategories(posts);
  const category = categories.find((c) => c.slug === slug);
  return { posts, categories, category };
}

export async function generateStaticParams() {
  const posts = await getCurrentBlogPosts();
  return getBlogCategories(posts).map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const { category } = await load(slug);
  if (!category) return { title: "Category Not Found" };

  // Title and description are editable per category in Page SEO, like any route.
  return withSeoOverride(`/blog/category/${category.slug}`, {
    title: `${category.name} Articles`,
    description: `Greentek's articles on ${category.name.toLowerCase()}: practical advice on solar PV, heat pumps, insulation and home improvement across the West Midlands and Wales.`,
  });
}

export default async function BlogCategoryPage({ params }: Props) {
  const { category: slug } = await params;
  const { posts, categories, category } = await load(slug);
  if (!category) notFound();

  return (
    <div className="flex flex-col min-h-screen">
      <PageSchema path={`/blog/category/${category.slug}`} />
      <Breadcrumbs crumbs={[{ label: "Blog", href: "/blog" }, { label: category.name }]} />
      <Header />

      <main className="flex-1">
        <BlogHero
          title={<span className="text-[#c5eb02]">{category.name}</span>}
          intro={`Every Greentek article on ${category.name.toLowerCase()}.`}
        />

        <BlogListing
          posts={postsInCategory(posts, category.slug)}
          categories={categories}
          totalPosts={posts.length}
          activeSlug={category.slug}
          title={`${category.name} articles`}
        />

        <div id="quote">
          <CtaSection eyebrow="Free Quote" heading="Ready to Start Your Project?" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
