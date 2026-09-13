import { getDb } from "./mongodb";
import {
  DEFAULT_ROBOTS_CONFIG,
  normalizeRobotsConfig,
  type RobotsConfig,
} from "@/lib/robotsConfig";
import {
  DEFAULT_LLMS_CONFIG,
  normalizeLlmsConfig,
  type LlmsConfig,
} from "@/lib/llmsConfig";

const COLLECTION = "siteFiles";

type RobotsDoc = RobotsConfig & { _id: "robots"; updatedAt?: string };
type LlmsDoc = LlmsConfig & { _id: "llms"; updatedAt?: string };

export async function getRobotsConfig(): Promise<RobotsConfig> {
  const db = await getDb();
  const doc = await db.collection<RobotsDoc>(COLLECTION).findOne({ _id: "robots" });
  if (!doc) return DEFAULT_ROBOTS_CONFIG;
  const { _id, updatedAt, ...config } = doc;
  return normalizeRobotsConfig(config);
}

export async function saveRobotsConfig(config: RobotsConfig): Promise<void> {
  const db = await getDb();
  await db
    .collection<RobotsDoc>(COLLECTION)
    .updateOne(
      { _id: "robots" },
      { $set: { ...config, updatedAt: new Date().toISOString() } },
      { upsert: true },
    );
}

export async function getLlmsConfig(): Promise<LlmsConfig> {
  const db = await getDb();
  const doc = await db.collection<LlmsDoc>(COLLECTION).findOne({ _id: "llms" });
  if (!doc) return DEFAULT_LLMS_CONFIG;
  const { _id, updatedAt, ...config } = doc;
  return normalizeLlmsConfig(config);
}

export async function saveLlmsConfig(config: LlmsConfig): Promise<void> {
  const db = await getDb();
  await db
    .collection<LlmsDoc>(COLLECTION)
    .updateOne(
      { _id: "llms" },
      { $set: { ...config, updatedAt: new Date().toISOString() } },
      { upsert: true },
    );
}
