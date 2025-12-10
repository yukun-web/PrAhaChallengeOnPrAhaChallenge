import type { ColumnBaseConfig } from "drizzle-orm";
import { eq } from "drizzle-orm";
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
 *
 * @param db データベースクライアントです。
 * @param table 集約テーブルです。
 * @param record 保存または更新するレコードです。
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

/**
 * ID から集約テーブルのデータを取得します。
 *
 * @param db データベースクライアントです。
 * @param table 集約テーブルです。
 * @param id 検索するレコードの ID です。
 * @returns 見つかった場合はレコードのデータを、存在しない場合は undefined を返します。
 */
export const findAggregateTableById = async <T extends { id: string }>(
  db: Database,
  table: AggregateTable,
  id: string,
): Promise<T | undefined> => {
  const [record] = await db
    .select({ data: table.data })
    .from(table)
    .where(eq(table.id, id))
    .limit(1)
    .execute();

  if (record === undefined) {
    return undefined;
  }

  // TODO: この as T をもう少し綺麗に処理したい。
  return record.data as T;
};
