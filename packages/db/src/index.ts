import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema.js";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

export const db = drizzle({
  connection: databaseUrl,
  schema,
});

export * from "./schema.js";
