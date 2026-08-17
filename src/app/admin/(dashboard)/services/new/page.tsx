import Link from "next/link";
import ServiceForm from "../../../_components/ServiceForm";
import SaveBanner from "../../../_components/SaveBanner";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function NewServicePage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <div>
      <Link href="/admin/services" className="text-sm text-zinc-500 hover:text-zinc-900">
        ← All Services
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">New Service</h1>

      <SaveBanner error={params.error} />

      <div className="bg-white border border-zinc-200 rounded-xl p-6">
        <ServiceForm />
      </div>
    </div>
  );
}
