import type { Metadata } from "next";
import { getCurrentSiteConfig } from "@/lib/cms";
import { withSeoOverride } from "@/lib/seo";
import { getMetaPixelSettings } from "@/lib/db/metaPixel";
import { getClaritySettings } from "@/lib/db/clarity";
import { getGoogleAnalyticsSettings } from "@/lib/db/googleAnalytics";
import { getGoogleAdsSettings } from "@/lib/db/googleAds";
import LegalPage, { LegalList, LegalSection } from "@/components/site/LegalPage";

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getCurrentSiteConfig();
  return withSeoOverride("/privacy", {
    title: "Privacy Policy",
    description: `How ${siteConfig.name} collects, uses and protects your personal data, and the cookies this site uses.`,
  });
}

export default async function PrivacyPage() {
  const [siteConfig, metaPixel, clarity, googleAnalytics, googleAds] = await Promise.all([
    getCurrentSiteConfig(),
    getMetaPixelSettings(),
    getClaritySettings(),
    getGoogleAnalyticsSettings(),
    getGoogleAdsSettings(),
  ]);
  const name = siteConfig.name;
  const { address } = siteConfig;

  // The cookie section is built from the same settings the root layout gives
  // the cookie banner, so the policy can't describe a category the banner
  // doesn't offer (it used to say "two kinds" with Meta under Necessary,
  // whatever the panel's Meta setting was).
  const meta = Boolean(metaPixel.pixelId);
  const metaNecessary = meta && metaPixel.consent === "necessary";
  const metaMarketing = meta && metaPixel.consent === "marketing";
  const ads = Boolean(googleAds.conversionId);
  const analyticsTools = [
    googleAnalytics.measurementId && "Google Analytics, which measures visits and page views",
    clarity.projectId &&
      "Microsoft Clarity, which records anonymised page interactions such as clicks and scrolling",
  ].filter(Boolean) as string[];
  const marketingTools = [
    metaMarketing && "the Meta Pixel, which shows us which Meta adverts lead to enquiries",
    ads && "Google Ads conversion tracking, which shows us which Google adverts lead to enquiries",
  ].filter(Boolean) as string[];

  return (
    <LegalPage
      path="/privacy"
      title="Privacy"
      highlight="Policy"
      intro={`How ${name} collects, uses and protects your personal data.`}
    >
      <LegalSection heading="1. Introduction">
        <p>
          {name} (&ldquo;we&rdquo;, &ldquo;our&rdquo; or &ldquo;us&rdquo;) is committed to protecting
          and respecting your privacy. This policy explains how we process any personal data we
          collect from you, or that you provide to us.
        </p>
      </LegalSection>

      <LegalSection heading="2. Information we collect">
        <p>We may collect and process the following data about you:</p>
        <LegalList
          items={[
            "Information you give us by filling in forms on our site, such as your name, email address, phone number, postcode and project details.",
            "Photos of your property that you choose to upload with a quote request.",
            "A record of any correspondence if you contact us.",
            "Details of your visits to our site, such as the pages you view and how you arrived at them, where you have allowed the cookies described below.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="3. How we use your information">
        <p>We use the information we hold about you to:</p>
        <LegalList
          items={[
            "provide the information or services you ask us for, such as a quote;",
            "carry out our obligations under any contract between you and us;",
            "tell you about changes to our service;",
            "make sure our site works well on your device and improve it over time.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="4. Data security">
        <p>
          All the information you provide is stored on secure servers, and we use strict procedures
          and security features to try to prevent unauthorised access. However, sending information
          over the internet is never completely secure, so we cannot guarantee the security of data
          sent to our site; any transmission is at your own risk.
        </p>
      </LegalSection>

      <LegalSection heading="5. Sharing your information">
        <p>
          We use trusted service providers to run this site: our website host, our database
          provider, our email provider, and Cloudinary, which stores any photos you upload. They
          process your data only on our instructions.
        </p>
        <p>
          We may also disclose your personal data to third parties if we are under a duty to do so
          to comply with a legal obligation, or to protect the rights, property or safety of {name},
          our customers or others. We do not sell your personal data.
        </p>
      </LegalSection>

      <LegalSection heading="6. Your rights">
        <p>
          You have the right to ask us not to process your personal data for marketing purposes.
          You can also ask for a copy of the information we hold about you, or ask us to correct or
          delete it, at any time by emailing{" "}
          <a href={`mailto:${siteConfig.email}`} className="font-semibold text-[#c5eb02] hover:underline">
            {siteConfig.email}
          </a>
          . If you are unhappy with how we have handled your data, you can complain to the
          Information Commissioner&apos;s Office (ico.org.uk).
        </p>
      </LegalSection>

      <LegalSection heading="7. Cookies" id="cookies">
        <p>
          Cookies are small files stored on your device. You can change your choice at any time
          from the Cookie settings link at the bottom of every page. Your choice is kept for six
          months, after which we ask again.
        </p>
        <p>
          <strong className="text-white">Necessary</strong> — always on. These keep the site secure
          and working and remember your cookie choice
          {metaNecessary ? (
            <>
              . They also include the Meta Pixel, which helps us measure which Meta adverts lead to
              enquiries. When you send us an enquiry, your email address and phone number are shared
              with Meta in a scrambled (hashed) form so the enquiry can be matched to the advert that
              brought you here
            </>
          ) : null}
          .
        </p>
        {analyticsTools.length > 0 && (
          <p>
            <strong className="text-white">Analytics</strong> — only with your permission. These
            show us how visitors use the site so we can improve it: {analyticsTools.join("; and ")}.
          </p>
        )}
        {marketingTools.length > 0 && (
          <p>
            <strong className="text-white">Marketing</strong> — only with your permission. These
            measure how our advertising performs: {marketingTools.join("; and ")}. If you allow
            them and then send us an enquiry, your email address and phone number are shared with
            the advertising platform in a scrambled (hashed) form so the enquiry can be matched to
            the advert that brought you here.
          </p>
        )}
      </LegalSection>

      <LegalSection heading="8. Contact">
        <p>
          Please send any questions, comments or requests about this privacy policy to{" "}
          <a href={`mailto:${siteConfig.email}`} className="font-semibold text-[#c5eb02] hover:underline">
            {siteConfig.email}
          </a>
          , or by post to our registered office at {address.line1}, {address.city},{" "}
          {address.postcode}.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
