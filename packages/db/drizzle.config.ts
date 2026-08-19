import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema.ts",
  out: "./migrations",
  dbCredentials: {
    url: databaseUrl,
  },
  // Supabase-managed Postgres roles (anon, authenticated, service_role, ...)
  // should not show up as schema drift in generated migrations.
  entities: {
    roles: {
      provider: "supabase",
    },
  },
});
