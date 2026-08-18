import { getPageContent } from "@/lib/cms";
import VerticalsClient from "./VerticalsClient";

export default async function Verticals() {
  const content = await getPageContent("verticals");
  return <VerticalsClient {...content} />;
}
