import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";

// Admin tests sign a session cookie with the same secret the site uses.
loadEnv({ path: ".env.local", quiet: true });

const PORT = Number(process.env.E2E_PORT || 3002);
const baseURL = process.env.E2E_BASE_URL || `http://localhost:${PORT}`;

/**
 * End-to-end tests against a production build (`pnpm build` first).
 *
 * Nothing leaves the machine: Meta, Google, Clarity and Cloudinary requests are
 * blocked or faked, and the enquiry endpoint is faked in the browser, so a run
 * never sends an email, uploads a photo or adds data to the analytics accounts.
 * See tests/e2e/fixtures.ts.
 *
 * PW_CHROMIUM_PATH runs the tests in an installed Chromium instead of
 * Playwright's own download.
 */
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  // Each worker is a full browser driving a production server. On a laptop
  // that's also running a dev server and a browser, more than two starves
  // hydration and turns timing-based checks flaky. Override with --workers.
  workers: 2,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: process.env.PW_CHROMIUM_PATH
      ? { executablePath: process.env.PW_CHROMIUM_PATH }
      : {},
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"] },
      // Crawls and API checks don't depend on screen size; running them once is enough.
      testIgnore: [/api\.spec/, /links\.spec/, /seo-files\.spec/, /admin\.spec/],
    },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `pnpm start -p ${PORT}`,
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
