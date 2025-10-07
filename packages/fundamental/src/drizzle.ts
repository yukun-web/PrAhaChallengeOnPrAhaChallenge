import type { ColumnBaseConfig } from "drizzle-orm";
import type { PgColumn, PgDatabase, PgQueryResultHKT, PgTable } from "drizzle-orm/pg-core";

/**
 * データベースクライアントの型のエイリアスです。
 */
export type Database = PgDatabase<PgQueryResultHKT>;

/**
 * 集約を扱うテーブルの型です。
 * 文字列型の id と JSON型の data を持つ必要があります。
 */
export type AggregateTable = PgTable & {
  id: PgColumn<ColumnBaseConfig<"string", string>>;
  data: PgColumn<ColumnBaseConfig<"json", string>>;
};

/**
 * 集約を扱うテーブルに upsert を行います。
 */
export const upsertAggregateTable = async <T extends { id: string }>(
  db: Database,
  table: AggregateTable,
  record: T,
): Promise<void> => {
  await db
    .insert(table)
    .values({ id: record.id, data: record })
    .onConflictDoUpdate({ target: table.id, set: { data: record } });
};
