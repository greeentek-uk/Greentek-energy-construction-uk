import { getPageContent } from "@/lib/cms";
import AreasClient from "./AreasClient";

export default async function Areas() {
  const content = await getPageContent("areas");
  return <AreasClient {...content} />;
}
