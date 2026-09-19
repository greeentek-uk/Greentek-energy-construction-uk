import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getCurrentSiteConfig } from "@/lib/cms";
import { withSeoOverride } from "@/lib/seo";
import PageSchema from "@/components/site/PageSchema";

export async function generateMetadata(): Promise<Metadata> {
  return withSeoOverride("/privacy", {
    title: "Privacy Policy",
    description: "Privacy policy for Greentek Construction.",
  });
}

export default async function PrivacyPage() {
  const siteConfig = await getCurrentSiteConfig();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <PageSchema path="/privacy" />
      <Header />
      <main className="flex-1 pt-24 pb-20">
        <div className="site-container">
          <h1 className="text-[2rem] md:text-[3.5rem] font-bold leading-[1.15] text-zinc-900 mb-8">
            Privacy <span className="text-green-600">Policy.</span>
          </h1>
          
          <div className="prose prose-zinc prose-sm md:prose-base site-prose text-zinc-600 space-y-8 font-medium">
            <section>
              <h2 className="text-sm font-bold text-zinc-900 mb-4 uppercase">1. Introduction</h2>
              <p>
                Greentek Construction (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is committed to protecting and respecting your privacy. 
                This policy sets out the basis on which any personal data we collect from you, or that you provide to us, 
                will be processed by us.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-zinc-900 mb-4 uppercase">2. Information We Collect</h2>
              <p>We may collect and process the following data about you:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Information you provide by filling in forms on our site, such as your name, email address, phone number, and project details.</li>
                <li>If you contact us, we may keep a record of that correspondence.</li>
                <li>Details of your visits to our site including, but not limited to, traffic data, location data, and other communication data.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-sm font-bold text-zinc-900 mb-4 uppercase">3. How We Use Your Information</h2>
              <p>We use information held about you in the following ways:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>To provide you with information or services that you request from us (e.g., project quotes).</li>
                <li>To carry out our obligations arising from any contracts entered into between you and us.</li>
                <li>To notify you about changes to our service.</li>
                <li>To ensure that content from our site is presented in the most effective manner for you and for your computer.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-sm font-bold text-zinc-900 mb-4 uppercase">4. Data Security</h2>
              <p>
                All information you provide to us is stored on secure servers. We use strict procedures and security features 
                to try to prevent unauthorised access. However, the transmission of information via the internet is not 
                completely secure; any transmission is at your own risk.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-zinc-900 mb-4 uppercase">5. Disclosure of Your Information</h2>
              <p>
                We may disclose your personal information to third parties if we are under a duty to disclose or share your 
                personal data in order to comply with any legal obligation, or to protect the rights, property, or safety of 
                Greentek Construction, our customers, or others.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-zinc-900 mb-4 uppercase">6. Your Rights</h2>
              <p>
                You have the right to ask us not to process your personal data for marketing purposes. You can also 
                request access to the information we hold about you at any time by contacting us at {siteConfig.email}.
              </p>
            </section>

            <section id="cookies" className="scroll-mt-28">
              <h2 className="text-sm font-bold text-zinc-900 mb-4 uppercase">7. Cookies</h2>
              <p>
                Cookies are small files stored on your device. We use two kinds, and you can change
                your choice at any time from the Cookie settings link at the bottom of every page.
              </p>
              <p className="mt-4">
                <strong>Necessary</strong> — always on. These keep the site secure and working,
                remember your cookie choice and help us measure how our advertising performs (Meta
                Pixel, used to see which Meta adverts lead to enquiries). When you send us an
                enquiry, your email address and phone number are shared with Meta in a scrambled
                (hashed) form so the enquiry can be matched to the advert that brought you here.
              </p>
              <p className="mt-4">
                <strong>Analytics</strong> — only with your permission. These show us how visitors
                use the site so we can improve it: Google Analytics, which measures visits and page
                views, and Microsoft Clarity, which records anonymised page interactions such as
                clicks and scrolling. Your choice is kept for six months, after which we ask again.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-zinc-900 mb-4 uppercase">8. Contact</h2>
              <p>
                Questions, comments and requests regarding this privacy policy are welcomed and should be addressed to: 
                <br />
                <strong>{siteConfig.email}</strong> or by post to our registered office at {siteConfig.address.line1}, {siteConfig.address.city}, {siteConfig.address.postcode}.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
