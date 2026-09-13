import Link from "next/link";
import { getSchemaOverride, GLOBAL_SCHEMA_PATH } from "@/lib/db/schemaOverrides";
import { deleteSchemaOverrideAction } from "../../../_actions/schema";
import SaveBanner from "../../../_components/SaveBanner";
import ConfirmSubmitButton from "../../../_components/ConfirmSubmitButton";
import SchemaBuilder from "../../../_components/SchemaBuilder";

interface Props {
  searchParams: Promise<{ path?: string; saved?: string; error?: string }>;
}

export default async function EditSchemaPage({ searchParams }: Props) {
  const params = await searchParams;
  const path = params.path || GLOBAL_SCHEMA_PATH;
  const isGlobal = path === GLOBAL_SCHEMA_PATH;
  const override = await getSchemaOverride(path);

  return (
    <div>
      <Link href="/admin/schema" className="text-sm text-white/50 hover:text-white">
        ← All Pages
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-1 break-all">
        {isGlobal ? "Schema: every page" : `Schema: ${path}`}
      </h1>
      <p className="text-white/50 mb-6 text-sm">
        {isGlobal
          ? "Added to every page on the site, alongside the built-in LocalBusiness schema."
          : "Added to this page only, alongside the schema built from its own content."}
      </p>

      <SaveBanner saved={params.saved === "1"} error={params.error} />

      <SchemaBuilder
        path={path}
        initialEntries={override.entries}
        initialReplaceDefault={override.replaceDefault}
        isGlobal={isGlobal}
      />

      {override.entries.length > 0 && (
        <form action={deleteSchemaOverrideAction} className="mt-6">
          <input type="hidden" name="path" value={path} />
          <ConfirmSubmitButton
            message="Remove all custom schema for this page? Its built-in schema keeps working."
            className="text-sm font-semibold text-red-400 hover:underline"
          >
            Remove all schema from this page
          </ConfirmSubmitButton>
        </form>
      )}
    </div>
  );
}
