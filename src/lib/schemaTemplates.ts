/**
 * Declarative schema.org templates behind the admin's schema builder.
 *
 * Each template describes its own form — flat fields plus repeatable groups —
 * and knows how to turn the collected values into a JSON-LD object. The admin
 * never sees raw JSON unless they pick the "Custom" type, which is the escape
 * hatch for anything not modelled here.
 */

export type SchemaFieldType = "text" | "textarea" | "url" | "number" | "date" | "time";

export interface SchemaField {
  key: string;
  label: string;
  type?: SchemaFieldType;
  placeholder?: string;
  help?: string;
  required?: boolean;
}

/** A repeatable block, e.g. the Q&A pairs in an FAQ. */
export interface SchemaGroup {
  key: string;
  label: string;
  addLabel: string;
  fields: SchemaField[];
}

export interface SchemaTemplate {
  type: string;
  label: string;
  description: string;
  fields: SchemaField[];
  groups: SchemaGroup[];
  /** Turns collected form values into the JSON-LD object that gets rendered. */
  build: (data: SchemaData) => object;
}

export type SchemaValue = string | number | SchemaData[];
export type SchemaData = Record<string, SchemaValue | undefined>;

/** The raw-JSON escape hatch. Not in TEMPLATES — it has no form of its own. */
export const CUSTOM_SCHEMA_TYPE = "Custom";

const text = (value: SchemaValue | undefined): string =>
  typeof value === "string" ? value.trim() : value === undefined ? "" : String(value);

const rows = (value: SchemaValue | undefined): SchemaData[] =>
  Array.isArray(value) ? value : [];

/** Drops empty keys so a half-filled form doesn't emit `"author": ""`. */
function compact<T extends Record<string, unknown>>(obj: T): T {
  const out = {} as T;
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value) && value.length === 0) continue;
    out[key as keyof T] = value as T[keyof T];
  }
  return out;
}

const ctx = { "@context": "https://schema.org" } as const;

export const TEMPLATES: SchemaTemplate[] = [
  {
    type: "FAQPage",
    label: "FAQ",
    description:
      "Question-and-answer pairs. Can show as expandable results under your listing.",
    fields: [],
    groups: [
      {
        key: "questions",
        label: "Questions",
        addLabel: "Add question",
        fields: [
          { key: "question", label: "Question", required: true },
          { key: "answer", label: "Answer", type: "textarea", required: true },
        ],
      },
    ],
    build: (data) => ({
      ...ctx,
      "@type": "FAQPage",
      mainEntity: rows(data.questions)
        .filter((row) => text(row.question) && text(row.answer))
        .map((row) => ({
          "@type": "Question",
          name: text(row.question),
          acceptedAnswer: { "@type": "Answer", text: text(row.answer) },
        })),
    }),
  },
  {
    type: "HowTo",
    label: "How-To",
    description: "Step-by-step instructions, e.g. how an installation works.",
    fields: [
      { key: "name", label: "Title", required: true, placeholder: "How we install solar PV" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "totalTime", label: "Total time", placeholder: "PT2H", help: "ISO 8601 duration — PT2H means 2 hours." },
      { key: "image", label: "Image URL", type: "url" },
    ],
    groups: [
      {
        key: "steps",
        label: "Steps",
        addLabel: "Add step",
        fields: [
          { key: "name", label: "Step name", required: true },
          { key: "text", label: "Instructions", type: "textarea", required: true },
          { key: "image", label: "Step image URL", type: "url" },
        ],
      },
    ],
    build: (data) =>
      compact({
        ...ctx,
        "@type": "HowTo",
        name: text(data.name),
        description: text(data.description),
        totalTime: text(data.totalTime),
        image: text(data.image),
        step: rows(data.steps)
          .filter((row) => text(row.name) || text(row.text))
          .map((row, index) =>
            compact({
              "@type": "HowToStep",
              position: index + 1,
              name: text(row.name),
              text: text(row.text),
              image: text(row.image),
            }),
          ),
      }),
  },
  {
    type: "BreadcrumbList",
    label: "Breadcrumbs",
    description: "The trail of pages leading to this one, shown above the result.",
    fields: [],
    groups: [
      {
        key: "items",
        label: "Trail",
        addLabel: "Add crumb",
        fields: [
          { key: "name", label: "Name", required: true },
          { key: "item", label: "URL", type: "url", required: true },
        ],
      },
    ],
    build: (data) => ({
      ...ctx,
      "@type": "BreadcrumbList",
      itemListElement: rows(data.items)
        .filter((row) => text(row.name))
        .map((row, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: text(row.name),
          item: text(row.item),
        })),
    }),
  },
  {
    type: "Service",
    label: "Service",
    description: "A service you offer, with its area and price range.",
    fields: [
      { key: "name", label: "Service name", required: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "serviceType", label: "Service type", placeholder: "Solar panel installation" },
      { key: "providerName", label: "Provider name", placeholder: "Greentek Construction" },
      { key: "areaServed", label: "Areas served", help: "Comma-separated, e.g. Wolverhampton, Dudley" },
      { key: "priceRange", label: "Price range", placeholder: "££" },
      { key: "url", label: "Page URL", type: "url" },
    ],
    groups: [],
    build: (data) =>
      compact({
        ...ctx,
        "@type": "Service",
        name: text(data.name),
        description: text(data.description),
        serviceType: text(data.serviceType),
        provider: text(data.providerName)
          ? { "@type": "LocalBusiness", name: text(data.providerName) }
          : undefined,
        areaServed: text(data.areaServed)
          ? text(data.areaServed).split(",").map((s) => s.trim()).filter(Boolean)
          : undefined,
        offers: text(data.priceRange)
          ? { "@type": "Offer", priceCurrency: "GBP", priceRange: text(data.priceRange) }
          : undefined,
        url: text(data.url),
      }),
  },
  {
    type: "Product",
    label: "Product",
    description: "A product with a price and rating — eligible for rich snippets.",
    fields: [
      { key: "name", label: "Product name", required: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "image", label: "Image URL", type: "url" },
      { key: "brand", label: "Brand" },
      { key: "sku", label: "SKU" },
      { key: "price", label: "Price", type: "number", placeholder: "4995" },
      { key: "priceCurrency", label: "Currency", placeholder: "GBP" },
      { key: "availability", label: "Availability", placeholder: "InStock", help: "InStock, OutOfStock or PreOrder." },
      { key: "ratingValue", label: "Rating value", type: "number", placeholder: "4.9" },
      { key: "reviewCount", label: "Review count", type: "number", placeholder: "127" },
    ],
    groups: [],
    build: (data) =>
      compact({
        ...ctx,
        "@type": "Product",
        name: text(data.name),
        description: text(data.description),
        image: text(data.image),
        sku: text(data.sku),
        brand: text(data.brand) ? { "@type": "Brand", name: text(data.brand) } : undefined,
        offers: text(data.price)
          ? compact({
              "@type": "Offer",
              price: text(data.price),
              priceCurrency: text(data.priceCurrency) || "GBP",
              availability: text(data.availability)
                ? `https://schema.org/${text(data.availability)}`
                : undefined,
            })
          : undefined,
        aggregateRating: text(data.ratingValue)
          ? compact({
              "@type": "AggregateRating",
              ratingValue: text(data.ratingValue),
              reviewCount: text(data.reviewCount),
            })
          : undefined,
      }),
  },
  {
    type: "Review",
    label: "Reviews / Rating",
    description: "An aggregate star rating plus individual reviews.",
    fields: [
      { key: "itemName", label: "What is being reviewed", required: true, placeholder: "Greentek Construction" },
      { key: "itemType", label: "Item type", placeholder: "LocalBusiness", help: "LocalBusiness, Product or Service." },
      { key: "ratingValue", label: "Average rating", type: "number", placeholder: "4.9" },
      { key: "reviewCount", label: "Number of reviews", type: "number", placeholder: "127" },
    ],
    groups: [
      {
        key: "reviews",
        label: "Individual reviews",
        addLabel: "Add review",
        fields: [
          { key: "author", label: "Reviewer name", required: true },
          { key: "reviewBody", label: "Review", type: "textarea" },
          { key: "ratingValue", label: "Rating (1-5)", type: "number" },
          { key: "datePublished", label: "Date", type: "date" },
        ],
      },
    ],
    build: (data) =>
      compact({
        ...ctx,
        "@type": text(data.itemType) || "LocalBusiness",
        name: text(data.itemName),
        aggregateRating: text(data.ratingValue)
          ? compact({
              "@type": "AggregateRating",
              ratingValue: text(data.ratingValue),
              reviewCount: text(data.reviewCount),
            })
          : undefined,
        review: rows(data.reviews)
          .filter((row) => text(row.author))
          .map((row) =>
            compact({
              "@type": "Review",
              author: { "@type": "Person", name: text(row.author) },
              reviewBody: text(row.reviewBody),
              datePublished: text(row.datePublished),
              reviewRating: text(row.ratingValue)
                ? { "@type": "Rating", ratingValue: text(row.ratingValue), bestRating: "5" }
                : undefined,
            }),
          ),
      }),
  },
  {
    type: "Article",
    label: "Article",
    description: "A news or blog article, with author and publish date.",
    fields: [
      { key: "headline", label: "Headline", required: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "image", label: "Image URL", type: "url" },
      { key: "authorName", label: "Author name" },
      { key: "datePublished", label: "Published", type: "date" },
      { key: "dateModified", label: "Last modified", type: "date" },
      { key: "url", label: "Article URL", type: "url" },
    ],
    groups: [],
    build: (data) =>
      compact({
        ...ctx,
        "@type": "Article",
        headline: text(data.headline),
        description: text(data.description),
        image: text(data.image),
        author: text(data.authorName)
          ? { "@type": "Person", name: text(data.authorName) }
          : undefined,
        datePublished: text(data.datePublished),
        dateModified: text(data.dateModified),
        url: text(data.url),
      }),
  },
  {
    type: "LocalBusiness",
    label: "Local Business",
    description: "Business name, address, phone and opening hours.",
    fields: [
      { key: "name", label: "Business name", required: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "telephone", label: "Phone" },
      { key: "email", label: "Email" },
      { key: "streetAddress", label: "Street address" },
      { key: "addressLocality", label: "City" },
      { key: "addressRegion", label: "Region" },
      { key: "postalCode", label: "Postcode" },
      { key: "priceRange", label: "Price range", placeholder: "££" },
      { key: "url", label: "URL", type: "url" },
    ],
    groups: [
      {
        key: "openingHours",
        label: "Opening hours",
        addLabel: "Add hours",
        fields: [
          { key: "days", label: "Days", placeholder: "Monday, Tuesday", help: "Comma-separated day names." },
          { key: "opens", label: "Opens", type: "time" },
          { key: "closes", label: "Closes", type: "time" },
        ],
      },
    ],
    build: (data) =>
      compact({
        ...ctx,
        "@type": "LocalBusiness",
        name: text(data.name),
        description: text(data.description),
        telephone: text(data.telephone),
        email: text(data.email),
        url: text(data.url),
        priceRange: text(data.priceRange),
        address: text(data.streetAddress) || text(data.addressLocality)
          ? compact({
              "@type": "PostalAddress",
              streetAddress: text(data.streetAddress),
              addressLocality: text(data.addressLocality),
              addressRegion: text(data.addressRegion),
              postalCode: text(data.postalCode),
              addressCountry: "GB",
            })
          : undefined,
        openingHoursSpecification: rows(data.openingHours)
          .filter((row) => text(row.days))
          .map((row) =>
            compact({
              "@type": "OpeningHoursSpecification",
              dayOfWeek: text(row.days).split(",").map((s) => s.trim()).filter(Boolean),
              opens: text(row.opens),
              closes: text(row.closes),
            }),
          ),
      }),
  },
  {
    type: "Organization",
    label: "Organization",
    description: "Company identity — logo, social profiles, contact.",
    fields: [
      { key: "name", label: "Organisation name", required: true },
      { key: "url", label: "Website URL", type: "url" },
      { key: "logo", label: "Logo URL", type: "url" },
      { key: "telephone", label: "Phone" },
      { key: "sameAs", label: "Social profile URLs", help: "Comma-separated." },
    ],
    groups: [],
    build: (data) =>
      compact({
        ...ctx,
        "@type": "Organization",
        name: text(data.name),
        url: text(data.url),
        logo: text(data.logo),
        telephone: text(data.telephone),
        sameAs: text(data.sameAs)
          ? text(data.sameAs).split(",").map((s) => s.trim()).filter(Boolean)
          : undefined,
      }),
  },
  {
    type: "Event",
    label: "Event",
    description: "A dated event with a location.",
    fields: [
      { key: "name", label: "Event name", required: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "startDate", label: "Starts", type: "date" },
      { key: "endDate", label: "Ends", type: "date" },
      { key: "locationName", label: "Venue name" },
      { key: "locationAddress", label: "Venue address" },
      { key: "url", label: "Event URL", type: "url" },
    ],
    groups: [],
    build: (data) =>
      compact({
        ...ctx,
        "@type": "Event",
        name: text(data.name),
        description: text(data.description),
        startDate: text(data.startDate),
        endDate: text(data.endDate),
        url: text(data.url),
        location: text(data.locationName)
          ? compact({
              "@type": "Place",
              name: text(data.locationName),
              address: text(data.locationAddress),
            })
          : undefined,
      }),
  },
  {
    type: "VideoObject",
    label: "Video",
    description: "An embedded video, eligible for the video carousel.",
    fields: [
      { key: "name", label: "Video title", required: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "thumbnailUrl", label: "Thumbnail URL", type: "url" },
      { key: "uploadDate", label: "Upload date", type: "date" },
      { key: "duration", label: "Duration", placeholder: "PT2M30S", help: "ISO 8601 — PT2M30S is 2m 30s." },
      { key: "contentUrl", label: "Video file URL", type: "url" },
      { key: "embedUrl", label: "Embed URL", type: "url" },
    ],
    groups: [],
    build: (data) =>
      compact({
        ...ctx,
        "@type": "VideoObject",
        name: text(data.name),
        description: text(data.description),
        thumbnailUrl: text(data.thumbnailUrl),
        uploadDate: text(data.uploadDate),
        duration: text(data.duration),
        contentUrl: text(data.contentUrl),
        embedUrl: text(data.embedUrl),
      }),
  },
  {
    type: "WebPage",
    label: "Web Page",
    description: "Generic page description — a safe default when nothing else fits.",
    fields: [
      { key: "name", label: "Page name", required: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "url", label: "URL", type: "url" },
      { key: "inLanguage", label: "Language", placeholder: "en-GB" },
    ],
    groups: [],
    build: (data) =>
      compact({
        ...ctx,
        "@type": "WebPage",
        name: text(data.name),
        description: text(data.description),
        url: text(data.url),
        inLanguage: text(data.inLanguage) || "en-GB",
      }),
  },
];

export function getTemplate(type: string): SchemaTemplate | undefined {
  return TEMPLATES.find((t) => t.type === type);
}

TEMPLATES.push({
  type: "Course",
  label: "Course",
  description: "A training course or certification, with its provider.",
  fields: [
    { key: "name", label: "Course name", required: true },
    { key: "description", label: "Description", type: "textarea" },
    { key: "providerName", label: "Provider name" },
    { key: "providerUrl", label: "Provider URL", type: "url" },
    { key: "url", label: "Course URL", type: "url" },
    { key: "courseMode", label: "Delivery mode", placeholder: "Onsite, Online or Blended" },
    { key: "duration", label: "Duration", placeholder: "P3D", help: "ISO 8601 — P3D means 3 days." },
    { key: "price", label: "Price", type: "number" },
    { key: "priceCurrency", label: "Currency", placeholder: "GBP" },
  ],
  groups: [],
  build: (data) => {
    const value = (key: string) => {
      const raw = data[key];
      return typeof raw === "string" ? raw.trim() : raw === undefined ? "" : String(raw);
    };
    const block: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "Course",
      name: value("name"),
    };
    if (value("description")) block.description = value("description");
    if (value("url")) block.url = value("url");
    if (value("providerName")) {
      block.provider = {
        "@type": "Organization",
        name: value("providerName"),
        ...(value("providerUrl") ? { url: value("providerUrl") } : {}),
      };
    }
    if (value("courseMode") || value("duration")) {
      block.hasCourseInstance = {
        "@type": "CourseInstance",
        ...(value("courseMode") ? { courseMode: value("courseMode") } : {}),
        ...(value("duration") ? { courseWorkload: value("duration") } : {}),
      };
    }
    if (value("price")) {
      block.offers = {
        "@type": "Offer",
        price: value("price"),
        priceCurrency: value("priceCurrency") || "GBP",
        category: "Paid",
      };
    }
    return block;
  },
});
