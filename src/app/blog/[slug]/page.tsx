import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getCurrentBlogPosts } from "@/lib/cms";
import { buildBlogPostingJsonLd, SITE_URL } from "@/lib/structuredData";

interface Props {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const blogPosts = await getCurrentBlogPosts();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: "Blog Post Not Found",
    };
  }

  return {
    title: { absolute: post.metaTitle },
    description: post.metaDescription,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      type: "article",
      publishedTime: post.date,
      authors: ["Greentek"],
    },
  };
}

export async function generateStaticParams() {
  const blogPosts = await getCurrentBlogPosts();
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const blogPosts = await getCurrentBlogPosts();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const jsonLd = buildBlogPostingJsonLd(post, SITE_URL);

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 md:py-20 border-b border-[#c5eb02]">
          <div className="mx-auto max-w-4xl px-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-block bg-[#c5eb02] text-black text-xs font-bold px-4 py-2 rounded-full">
                {post.category}
              </span>
              <time className="text-sm text-white/70 font-medium">
                {new Date(post.date).toLocaleDateString("en-GB", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>
            <h1 className="text-[2rem] md:text-[3.5rem] font-bold leading-[1.15] text-white mb-6">
              {post.title}
            </h1>
            <p className="text-lg md:text-xl text-white/70 leading-relaxed font-medium max-w-3xl">
              {post.excerpt}
            </p>
          </div>
        </section>

        {/* Cover Image */}
        <div className="relative h-96 md:h-125  w-full bg-black overflow-hidden flex items-center justify-center border-b border-[#c5eb02]">
          <Image
            src={post.coverImage}
            alt={post.coverImageAlt}
            fill
            className="object-contain object-center"
            priority
          />
        </div>

        {/* Content Section */}
        <section className="py-12 lg:py-24">
          <div className="mx-auto max-w-4xl px-6">
            <article className="prose prose-invert max-w-none">
              {post.content.map((block, idx) => {
                if (block.type === "heading") {
                  return (
                    <h2
                      key={idx}
                      className="text-[1.625rem] md:text-[2.5rem] font-bold leading-[1.2] text-white mt-12 mb-6"
                    >
                      {block.text}
                    </h2>
                  );
                }

                if (block.type === "paragraph") {
                  return (
                    <p
                      key={idx}
                      className="text-lg text-white/80 leading-relaxed mb-6 font-medium"
                    >
                      {block.text}
                    </p>
                  );
                }

                if (block.type === "list") {
                  return (
                    <ul
                      key={idx}
                      className="space-y-4 mb-8 list-disc list-inside"
                    >
                      {block.items?.map((item, itemIdx) => (
                        <li
                          key={itemIdx}
                          className="text-lg text-white/80 leading-relaxed font-medium"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  );
                }

                if (block.type === "cta") {
                  return (
                    <div
                      key={idx}
                      className="my-12 p-8 md:p-12 bg-white/5 rounded-xl border border-[#c5eb02]"
                    >
                      <h3 className="text-xl md:text-2xl font-bold text-white mb-4">
                        Ready to Get Started?
                      </h3>
                      <p className="text-lg text-white/80 mb-8 font-medium">
                        {block.text ||
                          "Discover how Greentek can help you achieve your energy and construction goals."}
                      </p>
                      <Link
                        href={block.ctaLink || "/contact"}
                        className="inline-flex items-center justify-center px-6 md:px-8 py-4 rounded-full bg-[#c5eb02] text-black text-sm font-bold hover:bg-[#c5eb02]/80 transition-all shadow-xl shadow-zinc-900/10"
                      >
                        {block.ctaText || "Get in Touch"}
                      </Link>
                    </div>
                  );
                }

                return null;
              })}
            </article>

            {/* Related Links */}
            <div className="mt-16 pt-12 border-t border-[#c5eb02]">
              <h3 className="text-[1.25rem] md:text-[1.5rem] font-bold leading-[1.3] text-white mb-8">
                Next Steps
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link
                  href="/services"
                  className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-[#c5eb02] hover:bg-white/10 transition-all"
                >
                  <h4 className="text-lg font-bold text-white mb-2">
                    View Our Services
                  </h4>
                  <p className="text-white/70 text-sm mb-4">
                    Explore solar PV, heat pumps, insulation, and refurbishment
                    solutions.
                  </p>
                  <span className="text-[#c5eb02] font-bold text-sm">
                    Learn More →
                  </span>
                </Link>
                <Link
                  href="/contact"
                  className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-[#c5eb02] hover:bg-white/10 transition-all"
                >
                  <h4 className="text-lg font-bold text-white mb-2">
                    Contact Us
                  </h4>
                  <p className="text-white/70 text-sm mb-4">
                    Ready to transform your energy? Get a free consultation
                    today.
                  </p>
                  <span className="text-[#c5eb02] font-bold text-sm">
                    Get in Touch →
                  </span>
                </Link>
              </div>
            </div>

            {/* Instagram Follow Section */}
            {post.instagramUrl && (
              <div className="mt-16 pt-12 border-t border-[#c5eb02]">
                <div className="p-8 md:p-12 rounded-xl border border-[#c5eb02] bg-white/5">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-white">
                        Follow on Instagram
                      </h3>
                      <p className="text-white/70 text-sm font-medium">
                        @greentekenergy.uk
                      </p>
                    </div>
                  </div>
                  <p className="text-lg text-white/80 mb-8 font-medium">
                    Follow Greentek on Instagram for energy-saving tips, project
                    updates, and home improvement ideas. Stay connected with our
                    latest renewable energy solutions and construction projects.
                  </p>
                  <a
                    href={post.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-10 py-5 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white text-sm font-bold hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 transition-all shadow-xl shadow-purple-900/20"
                  >
                    View Instagram Post →
                  </a>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Back to Blog */}
        <section className="py-12 border-t border-[#c5eb02]">
          <div className="mx-auto max-w-4xl px-6">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-[#c5eb02] font-bold hover:text-[#c5eb02]/80"
            >
              ← Back to Blog
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
