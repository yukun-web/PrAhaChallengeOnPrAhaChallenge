import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

loadEnvConfig(process.cwd());

/**
 * drizzle-kit の設定です。マイグレーションの際に使用されます。
 */
export default defineConfig({
  out: "./supabase/migrations",
  schema: "./packages/**/infrastructure/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.POSTGRES_URL as string,
  },
});
