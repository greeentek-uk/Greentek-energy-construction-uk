import { getSchemaOverride, GLOBAL_SCHEMA_PATH } from "@/lib/db/schemaOverrides";
import { renderSchemaEntries } from "@/lib/schemaRender";

/**
 * Serializes JSON-LD for injection. Escaping `<` stops a value containing
 * `</script` from closing the tag early, which would otherwise let
 * admin-entered text break out into executable markup.
 */
function serialize(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

interface PageSchemaProps {
  /** Route this page is served at, e.g. "/services/solar-pv-installations". */
  path: string;
  /** The code-built schema for the page, rendered unless the admin replaced it. */
  defaultJsonLd?: object;
}

/**
 * Emits a page's structured data: the schema built in `lib/structuredData.ts`,
 * plus every schema block the admin added for this exact route.
 */
export default async function PageSchema({ path, defaultJsonLd }: PageSchemaProps) {
  const override = await getSchemaOverride(path);
  const blocks = renderSchemaEntries(override.entries);
  const renderDefault = defaultJsonLd && !(blocks.length > 0 && override.replaceDefault);

  return (
    <>
      {renderDefault && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serialize(defaultJsonLd) }}
        />
      )}
      {blocks.map((block, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serialize(block) }}
        />
      ))}
    </>
  );
}

/** Site-wide custom schema, rendered on every page from the root layout. */
export async function GlobalCustomJsonLd() {
  return <PageSchema path={GLOBAL_SCHEMA_PATH} />;
}
