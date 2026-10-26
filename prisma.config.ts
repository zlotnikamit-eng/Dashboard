import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

config({ path: ".env.local" });

// Used by the Prisma CLI (migrate, studio) only — the app's own PrismaClient
// in lib/db.ts gets its connection string from DATABASE_URL via an adapter instead.
// DIRECT_URL (Supavisor session pooler) supports the DDL/prepared statements
// that migrations need; the app at runtime uses the transaction pooler (DATABASE_URL).
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});
