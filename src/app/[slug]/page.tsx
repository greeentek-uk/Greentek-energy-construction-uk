import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ContentBlocks from "@/components/ui/ContentBlocks";
import CtaSection from "@/components/sections/CtaSection";
import PageSchema from "@/components/site/PageSchema";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import FaqSection from "@/components/site/FaqSection";
import { getPageBySlug, getPublishedPages } from "@/lib/db/pages";
import { withSeoOverride } from "@/lib/seo";

interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * Renders pages created in the admin panel.
 *
 * This is a single dynamic segment at the root, so it only catches slugs that
 * no static route already claims — Next resolves `/about` to its own folder
 * before it reaches here. Reserved slugs are blocked at save time too, so a
 * page can't be created that would silently never appear.
 */
export async function generateStaticParams() {
  const pages = await getPublishedPages();
  return pages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) return { title: "Page not found" };

  return withSeoOverride(`/${page.slug}`, {
    title: page.metaTitle || page.title,
    description: page.metaDescription || page.subheading || "",
    image: page.heroImage,
  });
}

export default async function DynamicPage({ params }: Props) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  // An unpublished page is indistinguishable from a missing one to the public.
  if (!page || !page.published) notFound();

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <PageSchema path={`/${page.slug}`} />
      <Header />
      <Breadcrumbs crumbs={[{ label: page.title }]} />

      <main className="flex-1">
        <section className="px-5 sm:px-15 pt-10 pb-8">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-[2rem] md:text-[3.25rem] font-bold leading-[1.1] text-white text-balance">
              {page.heading || page.title}
            </h1>
            {page.subheading && (
              <p className="mt-5 text-lg md:text-xl text-white/70 font-medium leading-relaxed">
                {page.subheading}
              </p>
            )}
          </div>
        </section>

        {page.heroImage && (
          <section className="px-5 sm:px-15 pb-8">
            <div className="mx-auto max-w-4xl relative aspect-[16/9] overflow-hidden rounded-xl border border-white/10">
              <Image
                src={page.heroImage}
                alt={page.heroImageAlt || page.title}
                fill
                sizes="(min-width: 1024px) 900px, 100vw"
                className="object-cover"
                priority
              />
            </div>
          </section>
        )}

        <section className="px-5 sm:px-15 pb-8">
          <div className="mx-auto max-w-3xl">
            <ContentBlocks blocks={page.content} />
          </div>
        </section>

        <FaqSection faqs={page.faqs} />
        <CtaSection />
      </main>

      <Footer />
    </div>
  );
}
