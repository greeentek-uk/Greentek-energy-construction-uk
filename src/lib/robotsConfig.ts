export type RobotsDirective = "Allow" | "Disallow" | "Crawl-delay";

export interface RobotsRule {
  userAgent: string;
  directive: RobotsDirective;
  value: string;
}

export interface RobotsConfig {
  /** "rules" builds the file from the rows below; "raw" serves `raw` verbatim. */
  mode: "rules" | "raw";
  rules: RobotsRule[];
  includeSitemap: boolean;
  raw: string;
}

export const ROBOTS_DIRECTIVES: RobotsDirective[] = ["Allow", "Disallow", "Crawl-delay"];

/** What the site served before this was editable — also the starting point in the panel. */
export const DEFAULT_ROBOTS_RULES: RobotsRule[] = [
  { userAgent: "*", directive: "Allow", value: "/" },
  { userAgent: "*", directive: "Disallow", value: "/admin" },
];

export const DEFAULT_ROBOTS_CONFIG: RobotsConfig = {
  mode: "rules",
  rules: DEFAULT_ROBOTS_RULES,
  includeSitemap: true,
  raw: "",
};

/** One-click preset — the crawlers that scrape content to train models. */
export const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
  "Bytespider",
  "CCBot",
  "meta-externalagent",
];

export function aiCrawlerRules(): RobotsRule[] {
  return AI_CRAWLERS.map((userAgent) => ({
    userAgent,
    directive: "Disallow" as const,
    value: "/",
  }));
}

export function normalizeRobotsConfig(
  input: Partial<RobotsConfig> | null | undefined,
): RobotsConfig {
  if (!input) return DEFAULT_ROBOTS_CONFIG;
  return {
    mode: input.mode === "raw" ? "raw" : "rules",
    rules: Array.isArray(input.rules) ? input.rules : DEFAULT_ROBOTS_RULES,
    includeSitemap: input.includeSitemap ?? true,
    raw: typeof input.raw === "string" ? input.raw : "",
  };
}

/**
 * Renders the config as robots.txt text.
 *
 * Rules are grouped under each User-agent because the format is positional —
 * a directive belongs to whichever User-agent line precedes it, so emitting
 * them in entry order would silently reassign them to the wrong crawler.
 */
export function buildRobotsTxt(config: RobotsConfig, siteUrl: string): string {
  if (config.mode === "raw") {
    return config.raw.endsWith("\n") ? config.raw : `${config.raw}\n`;
  }

  const byAgent = new Map<string, RobotsRule[]>();
  for (const rule of config.rules) {
    const agent = rule.userAgent.trim() || "*";
    if (!rule.value.trim()) continue;
    if (!byAgent.has(agent)) byAgent.set(agent, []);
    byAgent.get(agent)!.push(rule);
  }

  const blocks: string[] = [];
  for (const [agent, rules] of byAgent) {
    const lines = [`User-agent: ${agent}`];
    for (const rule of rules) {
      lines.push(`${rule.directive}: ${rule.value.trim()}`);
    }
    blocks.push(lines.join("\n"));
  }

  if (config.includeSitemap) {
    blocks.push(`Sitemap: ${siteUrl}/sitemap.xml`);
  }

  return `${blocks.join("\n\n")}\n`;
}
