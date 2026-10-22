import type { Metadata } from "next";
import { getCurrentSiteConfig } from "@/lib/cms";
import { withSeoOverride } from "@/lib/seo";
import LegalPage, { LegalList, LegalSection } from "@/components/site/LegalPage";

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getCurrentSiteConfig();
  return withSeoOverride("/terms", {
    title: "Terms of Service",
    description: `The terms that apply when you use the ${siteConfig.name} website.`,
  });
}

export default async function TermsPage() {
  const siteConfig = await getCurrentSiteConfig();
  const name = siteConfig.name;

  return (
    <LegalPage
      path="/terms"
      title="Terms of"
      highlight="Service"
      intro={`The terms that apply when you use the ${name} website.`}
    >
      <LegalSection heading="1. Acceptance of terms">
        <p>
          By accessing or using this website, you agree to be bound by these Terms of Service and
          all applicable laws and regulations. If you do not agree with any of these terms, please
          do not use this site.
        </p>
      </LegalSection>

      <LegalSection heading="2. Services provided">
        <p>
          {name} provides construction, home improvement and renewable energy services, including
          but not limited to solar PV installation, heat pump installation, insulation and general
          building work. We may change or discontinue any service at any time.
        </p>
      </LegalSection>

      <LegalSection heading="3. Quotations and estimates">
        <p>
          All quotations and estimates given through this website or by email are subject to a site
          survey and a formal contract. We are not bound by any estimate until a written agreement
          has been signed by both parties.
        </p>
      </LegalSection>

      <LegalSection heading="4. Your obligations">
        <p>
          You agree to give accurate, current and complete information when you fill in a contact
          form or project enquiry. You also agree that:
        </p>
        <LegalList
          items={[
            "you will not use the website for any unlawful purpose;",
            "you will not attempt to gain unauthorised access to our systems;",
            "you will not use the site to transmit any harmful code or malware.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="5. Intellectual property">
        <p>
          The material on this website is protected by copyright and trademark law. Unless otherwise
          stated, {name} owns the intellectual property rights in all material on this website.
        </p>
      </LegalSection>

      <LegalSection heading="6. Limitation of liability">
        <p>
          To the extent permitted by law, {name} is not liable for any damage arising from the use
          of, or inability to use, the material on this website, even if we have been told of the
          possibility of such damage. Nothing in these terms limits any liability that cannot be
          limited by law.
        </p>
      </LegalSection>

      <LegalSection heading="7. Governing law">
        <p>
          These terms, and any claim relating to this website, are governed by the laws of England
          and Wales, without regard to conflict-of-law principles.
        </p>
      </LegalSection>

      <LegalSection heading="8. Contact us">
        <p>
          If you have any questions about these terms, please email{" "}
          <a href={`mailto:${siteConfig.email}`} className="font-semibold text-[#c5eb02] hover:underline">
            {siteConfig.email}
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
