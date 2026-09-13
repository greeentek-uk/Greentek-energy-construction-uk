export interface LlmsConfig {
  /** Serving the file at all — off returns a 404, as if it were never added. */
  enabled: boolean;
  /** "generated" assembles from live content using the flags below; "raw" serves `raw`. */
  mode: "generated" | "raw";
  /** Replaces the blockquote summary under the title. Blank uses the site description. */
  intro: string;
  includeCorePages: boolean;
  includeServices: boolean;
  includeLocations: boolean;
  includeBlog: boolean;
  blogLimit: number;
  includeOptional: boolean;
  raw: string;
}

export const DEFAULT_LLMS_CONFIG: LlmsConfig = {
  enabled: true,
  mode: "generated",
  intro: "",
  includeCorePages: true,
  includeServices: true,
  includeLocations: true,
  includeBlog: true,
  blogLimit: 20,
  includeOptional: true,
  raw: "",
};

export function normalizeLlmsConfig(
  input: Partial<LlmsConfig> | null | undefined,
): LlmsConfig {
  if (!input) return DEFAULT_LLMS_CONFIG;
  const blogLimit =
    typeof input.blogLimit === "number" && input.blogLimit >= 0 && input.blogLimit <= 200
      ? Math.round(input.blogLimit)
      : DEFAULT_LLMS_CONFIG.blogLimit;

  return {
    enabled: input.enabled ?? true,
    mode: input.mode === "raw" ? "raw" : "generated",
    intro: typeof input.intro === "string" ? input.intro : "",
    includeCorePages: input.includeCorePages ?? true,
    includeServices: input.includeServices ?? true,
    includeLocations: input.includeLocations ?? true,
    includeBlog: input.includeBlog ?? true,
    blogLimit,
    includeOptional: input.includeOptional ?? true,
    raw: typeof input.raw === "string" ? input.raw : "",
  };
}
