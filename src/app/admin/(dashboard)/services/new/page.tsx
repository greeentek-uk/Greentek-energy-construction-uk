import Link from "next/link";
import ServiceForm from "../../../_components/ServiceForm";
import SaveBanner from "../../../_components/SaveBanner";
import { getCurrentSiteConfig } from "@/lib/cms";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function NewServicePage({ searchParams }: Props) {
  const [params, { projects }] = await Promise.all([searchParams, getCurrentSiteConfig()]);

  return (
    <div>
      <Link href="/admin/services" className="text-sm text-white/50 hover:text-white">
        ← All Services
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">New Service</h1>

      <SaveBanner error={params.error} />

      <div className="bg-[#101314] border border-white/10 rounded-xl p-6">
        <ServiceForm projects={projects} />
      </div>
    </div>
  );
}
