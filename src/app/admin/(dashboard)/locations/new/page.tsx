import Link from "next/link";
import LocationForm from "../../../_components/LocationForm";
import SaveBanner from "../../../_components/SaveBanner";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function NewLocationPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <div>
      <Link href="/admin/locations" className="text-sm text-white/50 hover:text-white">
        ← All Locations
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">New Location</h1>

      <SaveBanner error={params.error} />

      <div className="bg-[#101314] border border-white/10 rounded-xl p-6">
        <LocationForm />
      </div>
    </div>
  );
}
