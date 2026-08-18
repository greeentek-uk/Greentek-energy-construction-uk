import { getPageContent } from "@/lib/cms";
import BrandsSectionClient from "./BrandsSectionClient";

export default async function BrandsSection() {
  const content = await getPageContent("brands");
  return <BrandsSectionClient {...content} />;
}
