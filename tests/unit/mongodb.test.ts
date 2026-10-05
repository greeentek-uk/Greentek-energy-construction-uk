import { afterEach, describe, expect, it, vi } from "vitest";

// A connect that fails once (the DNS blip) and then works.
const connect = vi.fn();
vi.mock("mongodb", () => ({
  MongoClient: vi.fn().mockImplementation(function () {
    return { connect };
  }),
}));

describe("getDb", () => {
  afterEach(() => {
    vi.resetModules();
    connect.mockReset();
    globalThis._mongoClientPromise = undefined;
  });

  it.each(["development", "production"])("retries after a failed connection (%s)", async (env) => {
    vi.stubEnv("NODE_ENV", env);
    vi.stubEnv("MONGODB_URI", "mongodb://example");
    const db = { name: "greentek" };
    connect
      .mockRejectedValueOnce(new Error("getaddrinfo EAI_AGAIN"))
      .mockResolvedValue({ db: () => db });
    const { getDb } = await import("@/lib/db/mongodb");

    await expect(getDb()).rejects.toThrow("EAI_AGAIN");
    // The failure isn't cached: the next request connects again and works…
    await expect(getDb()).resolves.toBe(db);
    // …and that good connection is reused.
    await getDb();
    expect(connect).toHaveBeenCalledTimes(2);
  });
});
