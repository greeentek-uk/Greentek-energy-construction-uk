import { getCurrentSiteConfig } from "@/lib/cms";
import HeaderClient from "./HeaderClient";

export default async function Header() {
  const siteConfig = await getCurrentSiteConfig();
  return <HeaderClient siteConfig={siteConfig} />;
}
