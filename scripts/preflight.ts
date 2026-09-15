/**
 * Pre-deployment check: everything that builds fine locally but fails, or
 * silently misbehaves, once it is live.
 *
 * Run before deploying, and after setting environment variables on the host.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

const REQUIRED = [
  ["MONGODB_URI", "Content, SEO settings and redirects all read from Mongo."],
  ["MONGODB_DB", "Database name."],
  ["ADMIN_USERNAME", "Admin panel login."],
  ["ADMIN_PASSWORD", "Admin panel login."],
  ["ADMIN_SESSION_SECRET", "Signs the admin session cookie."],
  ["CLOUDINARY_CLOUD_NAME", "Image delivery and uploads."],
  ["CLOUDINARY_API_KEY", "Signed uploads from the panel."],
  ["CLOUDINARY_API_SECRET", "Signed uploads and the media library listing."],
  ["GMAIL_USER", "Sends quote request emails."],
  ["GMAIL_APP_PASSWORD", "Gmail app password, not the account password."],
  ["NEXT_PUBLIC_SITE_URL", "Canonical URLs, sitemap, schema and llms.txt."],
] as const;

const OPTIONAL = [
  ["CONTACT_TO_EMAIL", "Defaults to info@greentekenergy.co.uk."],
  ["CLOUDINARY_UPLOAD_FOLDER", "Defaults to 'greentek'."],
] as const;

let failures = 0;
let warnings = 0;

console.log("Required environment variables");
for (const [name, why] of REQUIRED) {
  const value = process.env[name];
  if (!value) {
    console.log(`  ✗ ${name} — missing. ${why}`);
    failures++;
  } else {
    console.log(`  ✓ ${name}`);
  }
}

console.log("\nOptional");
for (const [name, why] of OPTIONAL) {
  console.log(process.env[name] ? `  ✓ ${name}` : `  · ${name} unset — ${why}`);
}

console.log("\nChecks");

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
if (/localhost|127\.0\.0\.1/.test(siteUrl)) {
  console.log(
    `  ✗ NEXT_PUBLIC_SITE_URL is "${siteUrl}". On the live host this must be the ` +
      `public origin, or every canonical, sitemap URL and schema link points at localhost.`,
  );
  failures++;
} else if (siteUrl && !siteUrl.startsWith("https://")) {
  console.log(`  ! NEXT_PUBLIC_SITE_URL is not https — "${siteUrl}"`);
  warnings++;
} else {
  console.log(`  ✓ Site URL: ${siteUrl || "(unset — will fall back to the production domain)"}`);
}

const secret = process.env.ADMIN_SESSION_SECRET ?? "";
if (secret && secret.length < 32) {
  console.log(`  ! ADMIN_SESSION_SECRET is only ${secret.length} characters. Use 32+.`);
  warnings++;
} else if (secret) {
  console.log("  ✓ Session secret length");
}

const password = process.env.ADMIN_PASSWORD ?? "";
if (password && password.length < 12) {
  console.log(`  ! ADMIN_PASSWORD is only ${password.length} characters.`);
  warnings++;
}

console.log(
  `\n${failures ? `${failures} blocking problem(s)` : "No blocking problems"}` +
    `${warnings ? `, ${warnings} warning(s)` : ""}.`,
);
process.exit(failures ? 1 : 0);
