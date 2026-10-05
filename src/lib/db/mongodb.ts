import { MongoClient, type Db } from "mongodb";

const dbName = process.env.MONGODB_DB || "greentek";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function connect(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Add it to .env.local, and to your Vercel project's " +
        "Environment Variables (generateStaticParams needs it at build time too).",
    );
  }
  return new MongoClient(uri).connect();
}

let clientPromise: Promise<MongoClient> | undefined;

/**
 * Cached MongoClient connection — one per module load in production, and cached on `global` in dev so it survives HMR reloads instead of opening a new connection on every edit.
 *
 * A *failed* connection is not kept. It used to be: one DNS blip at connect
 * time (`getaddrinfo EAI_AGAIN`) cached a rejected promise, and every request
 * after it failed with the same error until the process restarted — the dev
 * server until someone restarted it, a Vercel instance until it was recycled.
 * Now the failed attempt is dropped and the next request connects afresh.
 */
export async function getDb(): Promise<Db> {
  const dev = process.env.NODE_ENV === "development";
  let pending = dev ? global._mongoClientPromise : clientPromise;
  if (!pending) {
    pending = connect();
    if (dev) global._mongoClientPromise = pending;
    else clientPromise = pending;
  }

  try {
    const client = await pending;
    return client.db(dbName);
  } catch (err) {
    // Only clear it if no other request has already replaced it.
    if (dev && global._mongoClientPromise === pending) global._mongoClientPromise = undefined;
    if (!dev && clientPromise === pending) clientPromise = undefined;
    throw err;
  }
}
