import type { Database } from "@ponp/fundamental";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

/**
 * PostgreSQL の接続文字列です。
 */
const postgresUrl = process.env.POSTGRES_URL;
if (!postgresUrl) {
  throw new Error("POSTGRES_URL が設定されていません。");
}

/**
 * ローカルの PostgreSQL かどうかを判定します。
 */
const isLocalPostgresUrl = (urlString: string): boolean => {
  try {
    const url = new URL(urlString);
    const host = url.hostname;
    return host === "localhost" || host === "127.0.0.1" || host === "host.docker.internal";
  } catch {
    return false;
  }
};

/**
 * ローカルの PostgreSQL かどうかのフラグです。
 */
const isLocal = isLocalPostgresUrl(postgresUrl);

declare global {
  /**
   * Drizzle のデータベースインスタンスのキャッシュです。
   */
  var __pompDb: Database | undefined;
}

/**
 * Drizzle のデータベースインスタンスを作成します。
 *
 * @returns Drizzle のデータベースインスタンスを返します。
 */
export const createDb = (): Database => {
  if (globalThis.__pompDb) {
    return globalThis.__pompDb;
  }

  const client = postgres(postgresUrl, {
    // Supabase (PgBouncer) は Prepared Statement をサポートしないため無効化します。
    prepare: false,
    ssl: isLocal ? false : "require",
  });

  const db = drizzle({ client });
  globalThis.__pompDb = db;

  return db;
};
