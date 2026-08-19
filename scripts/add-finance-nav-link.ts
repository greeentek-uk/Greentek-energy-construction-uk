/**
 * One-time: adds a "Finance" entry to Settings.navLinks (rendered by both
 * Header and Footer). navLinks isn't exposed in the admin Settings form, so
 * this updates the DB directly. Safe to re-run — skips if already present.
 * Run via `npx tsx scripts/add-finance-nav-link.ts`.
 */
import { config } from "dotenv";
import { getDb } from "../src/lib/db/mongodb";
import { getSettings, updateSettings } from "../src/lib/db/settings";

config({ path: ".env.local" });

async function run() {
  await getDb();
  const settings = await getSettings();

  if (settings.navLinks.some((l) => l.href === "/finance")) {
    console.log("Finance nav link already present — nothing to do.");
    return;
  }

  const contactIdx = settings.navLinks.findIndex((l) => l.href === "/contact");
  const navLinks = [...settings.navLinks];
  const financeLink = { label: "Finance", href: "/finance" };

  if (contactIdx === -1) {
    navLinks.push(financeLink);
  } else {
    navLinks.splice(contactIdx, 0, financeLink);
  }

  await updateSettings({ navLinks });
  console.log("Added Finance nav link:", JSON.stringify(navLinks, null, 1));
}

run()
  .then(() => {
    console.log("Done.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Failed:", err);
    process.exit(1);
  });
