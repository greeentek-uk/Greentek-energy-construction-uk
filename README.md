<div align="center">

# Greentek Energy

**Content-managed marketing platform for a UK construction and renewable-energy contractor.**

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Tests](https://img.shields.io/badge/unit%20tests-91%20passing-success)](#testing)

</div>

---

## Overview

Greentek Energy Ltd delivers solar PV, heat pumps, insulation and property refurbishment across
the West Midlands and Wales. This repository contains the company's public website and the
administrative platform behind it.

The application is a **Next.js 16 front end over a MongoDB-backed content management system**.
Services, locations, projects, blog posts, navigation, shared page sections, company details,
per-page SEO, structured data, the sitemap, `robots.txt` and third-party tracking tags are all
stored in the database and managed through an authenticated panel at `/admin`.

> **Orientation note for new contributors.** Because content is database-driven rather than
> committed, searching the codebase for a phrase visible on the live site will usually return
> nothing. Content changes belong in the admin panel; this repository holds the systems that
> render and govern that content.

### Key capabilities

| Capability | Summary |
|---|---|
| **Headless content management** | Twenty administrative sections covering every content type, with role-gated access and no deployment required to publish |
| **Programmatic local SEO** | A location × service page matrix with per-combination copy, metadata and FAQs |
| **Layered metadata control** | Per-route overrides above site-wide templates above computed defaults |
| **Structured data** | Generated JSON-LD with a per-route builder for extension or replacement |
| **Conversion funnel** | A four-step mobile-first enquiry form with direct-to-CDN photo upload and server-verified lead reporting |
| **Consent-aware analytics** | GDPR-aligned consent gating applied on both the client and the server, with Google Consent Mode support |
| **Version history** | Rolling per-document snapshots with reversible restore |
| **Operational tooling** | Redirect management, live 404 monitoring, cache invalidation and a pre-deployment environment audit |

### Technology

Next.js 16 (App Router, React Server Components, Server Actions) · React 19 · TypeScript (strict) ·
Tailwind CSS v4 · MongoDB Atlas · Cloudinary · Nodemailer · Vitest · Playwright · Vercel.

---

## Contents

- [Getting started](#getting-started)
- [Environment configuration](#environment-configuration)
- [Commands](#commands)
- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Core systems](#core-systems)
- [Common tasks](#common-tasks)
- [Testing](#testing)
- [Deployment](#deployment)
- [Known issues](#known-issues)

---

## Getting started

**Prerequisites:** Node.js 20 or later, pnpm, and access to the project's MongoDB Atlas cluster,
Cloudinary account and sending mailbox.

```bash
pnpm install
cp .env.example .env.local           # populate — see Environment configuration
pnpm preflight                       # reports missing variables and why each is needed
pnpm seed:page-content               # required — see note below
pnpm seed:service-location-content
pnpm db:indexes
pnpm dev                             # http://localhost:3000 · panel at /admin
```

> **The content seed is mandatory.** Public pages resolve shared sections through
> `getPageContent()`, which raises an explicit error on a missing block rather than rendering an
> empty section. Both seed scripts are idempotent and will not overwrite existing content.

---

## Environment configuration

`.env.example` documents every variable in full. Summary:

| Group | Variables | Purpose |
|---|---|---|
| Database | `MONGODB_URI`, `MONGODB_DB` | All content. Also required at **build** time by `generateStaticParams` |
| Administration | `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` | Panel authentication and session signing |
| Media | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_UPLOAD_FOLDER` | Uploads, media library and image delivery |
| Email | `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `CONTACT_TO_EMAIL` | Enquiry notifications. Requires a Gmail App Password, not an account password |
| Site | `NEXT_PUBLIC_SITE_URL` | Canonical URLs, sitemap, structured data and `llms.txt` |
| Cache | `REVALIDATE_SECRET` | Cross-environment cache invalidation. Must be identical everywhere a panel runs |
| Optional | `META_CAPI_ACCESS_TOKEN` | Server-side conversion events; the browser pixel operates without it |

A `NEXT_PUBLIC_SITE_URL` pointing at localhost causes a deployed build to **fail deliberately**,
preventing a release in which every canonical URL, sitemap entry and schema link resolves to
localhost.

---

## Commands

| Command | Description |
|---|---|
| `pnpm dev` | Development server |
| `pnpm build` / `pnpm start` | Production build and server |
| `pnpm check` | Lint, type-check and unit tests — **the pre-merge gate** |
| `pnpm test` | Unit tests (Vitest) |
| `pnpm test:e2e` | End-to-end tests (Playwright, against a production build) |
| `pnpm typecheck` | Type-checks both the application and the test suite |
| `pnpm lint` | ESLint |
| `pnpm preflight` | Pre-deployment environment audit |
| `pnpm db:indexes` | Creates required database indexes; idempotent |
| `pnpm seed:page-content` | Seeds shared page-content blocks |
| `pnpm seed:service-location-content` | Seeds location × service copy |
| `pnpm migrate` | Legacy one-off import from `src/data/*.json` |

---

## Architecture

```
  Request
     │
     ▼
  src/proxy.ts                        Node runtime · matches nearly every path
     ├─ /admin/*    Session validation, redirecting to /admin/login when absent
     ├─ Public      Managed redirect table — 301/302/307/410, wildcard sources,
     │              hit counters. Admin paths are exempt so no rule can lock out
     │              the panel.
     └─ All         Content-Security-Policy assembled per request from the
                    administrator's script allowlist
     │
     ▼
  Route segment (React Server Component)
     └─ src/lib/cms.ts                Request-scoped caching via React `cache()`, so the
        └─ src/lib/db/*.ts            header, footer and page body share one set of reads
```

> **Do not reintroduce a Content-Security-Policy in [next.config.ts](next.config.ts).** Browsers
> intersect multiple CSP headers, so a statically defined policy would silently override the
> dynamic one and block every tag added through the panel — the tag would appear in the markup and
> never execute. The header is therefore constructed per request in [src/proxy.ts](src/proxy.ts).

---

## Project structure

```
src/
  app/
    page.tsx                     Homepage — composes shared sections
    about|contact|projects|      Static routes
      services|locations|blog|
      finance|privacy|terms/
    energy-solutions/            Vertical landing pages
    home-solutions/
    services/[slug]/             ─┐
    projects/[slug]/              │  Generated from the database
    locations/[locationSlug]/     │
      [serviceSlug]/              │  Location × service matrix — the primary SEO surface
    blog/[slug]/                  │
    [slug]/                      ─┘  Catch-all for pages authored in the panel
    thank-you/                   Conversion page (noindex); reports the lead event
    admin/
      login/
      (dashboard)/               One directory per administrative section
      _actions/                  Server actions — all writes
      _components/               Forms and editors
    api/
      quote-request/             Enquiry intake — notification email and server-side lead event
      quote-upload/              Signs direct-to-Cloudinary photo uploads
      track/                     Browser-to-Conversions-API relay
      revalidate/                Cross-host cache invalidation (shared secret)
      not-found/                 404 reporting
    sitemap.ts  robots.txt/  llms.txt/

  components/
    layout/                      Header and footer
    sections/                    Page sections (hero, projects, testimonials, …)
    site/                        Cross-cutting concerns: consent, tracking, schema, breadcrumbs
    ui/                          Shared primitives

  data/                          Type definitions only — content resides in MongoDB
  lib/
    db/                          One module per collection; the client is cached per process
    cms.ts                       Assembles the site configuration, request-cached
    seo.ts, seoTemplates.ts      Metadata resolution
    structuredData.ts            JSON-LD builders
    quoteForm.ts                 Option sets shared by both enquiry forms
    analytics.ts, consent.ts     Tracking and consent
    imageLoader.ts               Custom Next.js image loader targeting Cloudinary
  proxy.ts

scripts/                         Seeds, migration, index creation, preflight audit
tests/unit/                      Vitest — isolated logic, fully mocked
tests/e2e/                       Playwright — hermetic, no outbound requests
assets/client-source/            Client-supplied originals; not served
```

**Component convention.** A `*Client.tsx` file beside a section (for example `Projects.tsx` and
`ProjectsClient.tsx`) denotes the standard split: the server component performs data access, the
client component handles interactivity.

**Collections.** `services` · `projects` · `locations` · `locationServiceContent` · `blogPosts` ·
`pages` · `pageContent` · `settings` · `seoOverrides` · `schemaOverrides` · `redirects` ·
`notFoundLog` · `revisions` · `siteFiles` · `enquirySessions` · `counters` · `siteSettings`
(keyed documents for `menus`, `headScripts`, `seoTemplates`, `metaPixel`, `clarity`,
`googleAnalytics`, `imageDelivery`, `sitemap` and `breadcrumbs`).

---

## Core systems

Review this section before modifying the areas it describes. Each design carries a rationale that
is not evident from the code alone.

### 1 · Layered metadata resolution

Page metadata is produced by `withSeoOverride()` in [src/lib/seo.ts](src/lib/seo.ts), resolving in
a fixed precedence:

```
per-route override  →  site-wide template for the page type  →  the page's computed default
```

This ordering allows every page of a given type to be restyled centrally without discarding a
title written by hand for an individual route. Templates support `%token%` placeholders
(`%service%`, `%location%`, `%sitename%`, and others); `applyTemplate()` removes orphaned
separators and dangling connecting words when a token resolves empty, since a published title
reading `Solar PV in | Greentek` is worse than a shorter one.

Structured data is generated in [src/lib/structuredData.ts](src/lib/structuredData.ts) and may be
extended or replaced per route through the panel's schema builder. Breadcrumbs emit their visual
trail and `BreadcrumbList` markup from a single source so the two cannot diverge. The sitemap
excludes `noindex` routes automatically. Both `robots.txt` and `llms.txt` are editable in rule or
raw mode, including a preset for restricting AI crawlers.

### 2 · Draft and publish

Documents in the `pageContent` collection maintain separate `draft` and `published` copies. Public
pages read `published`; the panel edits `draft` and surfaces an outstanding-change count alongside
a **Publish Changes** action.

All other content types — services, locations, projects, posts, pages and settings — publish on
save.

### 3 · Event-driven cache invalidation

Invalidation is triggered by writes rather than by expiry. Each save clears precisely what it
affected via [src/lib/revalidate.ts](src/lib/revalidate.ts). When the panel runs outside the live
host, the same invalidation is forwarded to `/api/revalidate` using `REVALIDATE_SECRET`. The panel
displays a persistent warning when that secret is absent, because the failure is otherwise
invisible: the database updates while the live site continues serving cached HTML. A manual
**Refresh live site** action is available on the dashboard.

### 4 · Enquiry capture and media handling

Two forms submit to a single endpoint, differentiated by a `source` field:

- [`HeroQuoteForm`](src/components/sections/HeroQuoteForm.tsx) — a four-step form optimised for
  one-handed mobile completion, requesting project details first and contact details last.
- [`CtaSection`](src/components/sections/CtaSection.tsx) — the full single-page form.

Shared option sets are defined in [src/lib/quoteForm.ts](src/lib/quoteForm.ts) to prevent the two
from diverging.

Photographs upload to Cloudinary directly from the client while the form is still in progress,
bypassing the server and platform request-size limits. This produces several deliberate
constraints:

- An enquiry number is issued with the first upload, before submission is known. A token binds
  subsequent uploads and the final submission to the same record.
- The upload signature fixes the destination folder, permitted formats and stored transformation,
  so the client cannot broaden any of them. Quotas apply per enquiry, per client and per day.
- Media belonging to abandoned forms is reclaimed opportunistically during later uploads, without
  a scheduled job.
- `/api/quote-request` re-validates every photograph URL against the originating enquiry's own
  folder before including it in outbound email.

### 5 · Consent enforcement

The visitor's choice is stored in a versioned first-party cookie so that server routes can read it
directly; the server will not forward an event the visitor has not permitted, irrespective of what
the client sends. Google Consent Mode defaults are established inline at the top of `<head>` ahead
of any tag. Administrator-supplied snippets render as inert placeholders and are activated only
once their category is permitted, preserving the execution order vendor code depends upon.

Conversion events are dispatched through both the browser pixel and the Conversions API using a
shared event identifier, so they are deduplicated while remaining recoverable when the pixel is
blocked. `/api/track` is publicly reachable and therefore accepts only an allowlist of events and
a narrow set of descriptive fields. **Lead events cannot be submitted from the browser**; they are
sent server-to-server once an enquiry has genuinely been received, preventing fabricated
conversions from entering campaign optimisation data.

### 6 · Image delivery

[src/lib/imageLoader.ts](src/lib/imageLoader.ts) is registered through `images.loaderFile` and
therefore applies to every image without call-site changes. Cloudinary-hosted assets are resized
and format-negotiated by Cloudinary, which already holds the originals; other assets fall through
to the built-in optimiser, except in development, where local files are served directly because
`/_next/image` is unavailable alongside a custom loader. Any pre-existing transformation in a URL
is preserved and the delivery transformation is chained after it rather than merged, so deliberate
crops behave as intended.

---

## Common tasks

| Task | Location |
|---|---|
| Amend visible copy | The admin panel, in nearly all cases |
| Add a service, location, project or post | Panel → the corresponding section |
| Publish a standalone page | Panel → Pages; rendered by `src/app/[slug]` |
| Introduce a new shared section | Define the type in [src/data/pageContent.ts](src/data/pageContent.ts), add a form under `admin/_components/pageContent/`, add a seed entry, then build the component |
| Add a tracking tag | Panel → Scripts & Tracking; add the domain to the allowlist or the policy will block it |
| Add an enquiry-form option | [src/lib/quoteForm.ts](src/lib/quoteForm.ts) — both forms and the notification email read from it |
| Add a route | Create the segment, then register it in [src/lib/routes.ts](src/lib/routes.ts) so the SEO editor and sitemap include it |
| Revert an unwanted edit | Panel → Version History; five snapshots per document, and restores are themselves reversible |
| Investigate broken links | Panel → Redirects & 404s, populated by live 404 reporting |
| Audit missing alt text | Panel → Media |

Slugs listed in `RESERVED_SLUGS` ([src/data/pages.ts](src/data/pages.ts)) are rejected at save
time: Next.js resolves static segments ahead of dynamic ones, so such a page would save
successfully and then never appear.

---

## Testing

**Unit** — [tests/unit](tests/unit), Vitest. Isolated logic with no server, database, email or
network access; any such dependency is mocked within the test.

**End-to-end** — [tests/e2e](tests/e2e), Playwright, executed against a production build on port
3002 across desktop and mobile projects. The suite is **hermetic**: analytics providers and
Cloudinary are blocked or stubbed and the enquiry endpoint is intercepted, so no run sends email,
uploads media or contributes data to production analytics accounts. Preserve this property when
extending the suite — see [tests/e2e/fixtures.ts](tests/e2e/fixtures.ts).

Coverage includes the consent banner and the loading behaviour of each choice, both enquiry forms
end to end with photo validation and retry handling, every sitemap route for baseline correctness
and mobile layout integrity, a site-wide link and image crawl, the generated SEO files, conversion
tracking, and a read-only pass across every administrative page.

Set `PW_CHROMIUM_PATH` to run against an installed Chromium rather than Playwright's bundled
download.

---

## Deployment

1. Run `pnpm check` — lint, types and unit tests.
2. Run `pnpm preflight` against the target environment's configuration.
3. Configure all required variables in the host's project settings, **including `MONGODB_URI`**,
   which is read during the build.
4. Deploy, then run `pnpm db:indexes`. This is idempotent, and without it the 404 log and revision
   history degrade to full collection scans that eventually exceed MongoDB's 32 MB in-memory sort
   limit.
5. Verify that `REVALIDATE_SECRET` is identical across every environment running a panel.

---

## Known issues

Four end-to-end failures are currently recorded under `test-results/`:

| Issue | Resolution |
|---|---|
| `/images/brands/swip.png` returns 404 on `/about` and in the media library | The asset is absent from `public/images/brands/` and the reference is held in the `brands` page-content block in the database. Resolve through the admin panel or restore the asset — no code change applies. |
| The hero heading wraps to three lines rather than two, on desktop and mobile | Front-end fix required in the hero section. |

---

## Further documentation

[CLAUDE.md](CLAUDE.md) contains a condensed architectural reference together with the conventions
expected of contributions. The files under [docs/](docs/) are currently placeholders.

---

<div align="center">
<sub>Proprietary software. © Greentek Energy Ltd. All rights reserved.</sub>
</div>
