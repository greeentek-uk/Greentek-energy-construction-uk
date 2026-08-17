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

/** Cached MongoClient connection — one per module load in production, and cached on `global` in dev so it survives HMR reloads instead of opening a new connection on every edit. */
export async function getDb(): Promise<Db> {
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = connect();
    }
    clientPromise = global._mongoClientPromise;
  } else if (!clientPromise) {
    clientPromise = connect();
  }

  const client = await clientPromise;
  return client.db(dbName);
}
