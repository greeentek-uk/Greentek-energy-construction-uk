# CLAUDE.md

Greentek Energy — a UK construction / renewable-energy contractor site (West Midlands & Wales).
It is not a brochure site: it is a **Next.js 16 front end over a MongoDB-backed CMS**, with a
full self-serve admin panel, a technical-SEO control surface, a multi-step lead-capture funnel,
and consent-gated analytics. Almost nothing the client sees is hard-coded.

## Commands

```bash
pnpm dev                  # next dev
pnpm build && pnpm start  # production; e2e runs against this
pnpm check                # lint + typecheck + unit tests  ← run before calling work done
pnpm test                 # vitest, tests/unit (no network/db/email — all mocked)
pnpm test:e2e             # playwright, tests/e2e (needs a prod build on :3002)
pnpm typecheck            # tsc --noEmit  AND  tsc -p tests/tsconfig.json
pnpm preflight            # env-var audit before deploying
pnpm db:indexes           # idempotent; run after deploy
pnpm seed:page-content    # required or public pages throw (see getPageContent)
pnpm seed:service-location-content
pnpm migrate              # one-off src/data/*.json → Mongo
```

Package manager is **pnpm** (see `packageManager` + `pnpm-workspace.yaml`). Node >= 20.

## Architecture in one pass

```
request → src/proxy.ts (Node runtime, runs on nearly everything)
            ├─ /admin/*  → session-cookie gate, else redirect to /admin/login
            ├─ else      → admin-managed redirect table (301/302/307/410, wildcards, hit counter)
            └─ always    → Content-Security-Policy built per request from the admin's allowlist
          ↓
        page.tsx → lib/cms.ts (React `cache`, one Mongo round trip per request)
          ↓
        lib/db/*.ts  ← every collection accessor; getDb() caches the client (global in dev, HMR-safe)
```

**Key rule:** the CSP is deliberately *absent* from `next.config.ts`. Browsers intersect two CSP
headers, so a static one would neuter the dynamic one in `proxy.ts` and silently kill every
admin-added tag. Don't add one back.

### Content model (`src/data/*.ts` are types only; the data lives in Mongo)

| Type | Collection | Public route |
|---|---|---|
| `Service` | `services` | `/services/[slug]` |
| `Project` (before/after) | `projects` | `/projects/[slug]` |
| `Location` | `locations` | `/locations/[locationSlug]` |
| `LocationServiceContent` | `locationServiceContent` | `/locations/[loc]/[svc]` — the combinatorial SEO surface |
| `BlogPost` | `blogPosts` | `/blog/[slug]` |
| `SitePage` | `pages` | `/[slug]` — catch-all for admin-created pages |
| `PageContentMap` blocks | `pageContent` | shared sections, keyed (`home-hero`, `faq`, …) |
| `SiteConfig` | `siteSettings` | company details, overlaid with `menus` for nav |

`ContentBlock` (`src/data/content.ts`) is the shared long-form body shape for services, locations,
pages and posts. `FaqItem` arrays attach to any of them and are rendered *and* marked up as
FAQPage schema from the same source.

`RESERVED_SLUGS` in `src/data/pages.ts` blocks admin pages that a static route would shadow.

### The draft/publish split — only for page content

`pageContent` docs hold **both** `draft` and `published`. Public pages read `published`
(`getPageContent`, which *throws* if unseeded — a loud failure beats a blank section); the admin
edits `draft` and clicks **Publish Changes** in the sidebar (badge = dirty count).
Everything else — services, pages, posts, settings — goes live on save.

### Caching & revalidation

Event-driven, no timers. A save clears exactly what it changed via `lib/revalidate.ts`. When the
panel runs somewhere other than the live host, it pushes to `/api/revalidate` using the shared
`REVALIDATE_SECRET`; the admin layout warns loudly when that isn't configured. "Refresh live site"
on the dashboard is the manual escape hatch.

## Feature areas

**Admin panel** (`/admin`, 20 sections — see `navItems` in `src/app/admin/(dashboard)/layout.tsx`).
Single account, HMAC-signed 12h cookie (`lib/auth.ts`, `timingSafeEqual` throughout). Every write
is a server action in `src/app/admin/_actions/*`. Sections: Page SEO, SEO Settings, Schema,
Sitemap, Redirects & 404s, Local SEO, Page Content, Pages, Menus, Blog, Services, Projects,
Locations, Scripts & Tracking, robots/llms, Media, Image Delivery, Version History, Settings.

**SEO.** Three-layer resolution, always in this order: per-route override → site-wide template for
that page kind → the page's own computed default (`lib/seo.ts` `withSeoOverride`). Templates use
`%token%` placeholders and `applyTemplate` tidies orphaned separators/connecting words when a token
is empty. Also: JSON-LD (`lib/structuredData.ts` + admin `SchemaBuilder` per route, with
`replaceDefault`), breadcrumbs emitted with matching BreadcrumbList markup, sitemap that drops
noindex pages automatically, editable `robots.txt` (incl. a one-click AI-crawler block preset) and
a generated `llms.txt`, internal-link *suggestions* (never auto-inserted, by design).

**Lead capture.** Two forms post to `/api/quote-request`: the 4-step hero form
(`HeroQuoteForm.tsx`, job → property/budget → photos → contact last) and the full contact form
(`CtaSection.tsx`); `source` distinguishes them. Enquiries get a sequential number from a Mongo
counter. Photos go **straight from the phone to Cloudinary** via a signed upload
(`/api/quote-upload`) — folder, formats and a `c_limit,w_2000,q_auto:good,f_jpg` transform are all
inside the signature, so the browser can't widen them. Caps at three levels (per enquiry, per IP
per window, per day). Photos from forms that were never sent are swept opportunistically on later
uploads. `/api/quote-request` re-validates every photo URL against that enquiry's own folder before
putting it in an email. Email via Gmail SMTP (`lib/mailer.ts`), everything HTML-escaped.

**Analytics & consent.** Cookie consent in a first-party cookie (`gt_consent`, versioned) so API
routes can read it too — the server never forwards an event the visitor didn't agree to.
Google Consent Mode defaults are set inline at the top of `<head>` before any tag. Admin-added
snippets render as `type="text/plain"` placeholders and are promoted to real scripts only once
their category is allowed (`lib/consentScripts.ts`, preserving load order). Meta events go through
both the browser pixel and the Conversions API with a **shared event id** for dedup; `/api/track`
is public so it accepts only an event allowlist and five safe `custom_data` keys — **`Lead` can
never be posted from the browser**, it is sent server-to-server once an enquiry is really received.

**Images.** Custom Next loader (`lib/imageLoader.ts`) sends Cloudinary URLs to Cloudinary for
resize/format, chaining our transform *after* any hand-pasted one rather than merging. Non-
Cloudinary files fall through to Next's optimizer (and are served raw in dev, where `/_next/image`
doesn't exist with a custom loader). Delivery settings (quality, `f_auto`, max width, `dpr_auto`)
are admin-controlled and pushed into module state by `ImageDeliveryProvider` on both server and
client so srcSets match. `lib/mediaUsage.ts` answers "which images still have no alt text".

**Other.** Version history (5 snapshots per doc, count-capped, restore is itself snapshotted so it
can be undone). 404 logger feeding the redirects screen. Finance page + calculator (Ideal4Finance).
OpenWidget chat. WhatsApp/phone floating actions.

## Conventions

- Comments explain **why**, often at length, and frequently record a trade-off or a thing that was
  tried and failed. Match that; don't strip them.
- `@/*` → `src/*`. Strict TypeScript.
- Brand colour is `#c5eb02` on near-black (`#101314` panels).
- Admin rich text is sanitized **on write** (`lib/richText.ts`), never at render.
- Shared option lists (`lib/quoteForm.ts`, `lib/reviewSources.ts`) exist so the public form and the
  admin form can't drift apart. Add values there, not inline.
- `lib/routes.ts` is the single enumeration of generated routes; the SEO editor and sitemap read it.
- E2E tests never touch the outside world — Meta/Google/Clarity/Cloudinary are blocked or faked in
  `tests/e2e/fixtures.ts`. Keep it that way.

## Current state (2026-09-18)

- Unit tests: **91 passing** across 9 files.
- E2E: 4 known failures recorded in `test-results/` —
  1. `/images/brands/swip.png` 404s on `/about` and in the media library. The file isn't in
     `public/images/brands/`; the reference lives in the **`brands` pageContent block in Mongo**,
     not in the repo, so fix it in the admin panel (or re-add the asset), not in code.
  2. The hero heading wraps to 3 lines instead of 2 on both desktop and mobile.
- `docs/client-brief.md`, `docs/site1-content-map.md` and `docs/site1-qa-checklist.md` are empty
  placeholders. `README.md` still describes the original scaffold and is badly out of date.
