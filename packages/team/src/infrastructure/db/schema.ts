import { jsonb, pgSchema, varchar } from "drizzle-orm/pg-core";

/**
 * チームコンテキストのデータを格納するスキーマです。
 */
export const teamSchema = pgSchema("team");

/**
 * チームテーブルです。
 */
export const teamsTable = teamSchema.table("teams", {
  /**
   * チームIDです。
   */
  id: varchar({ length: 36 }).primaryKey(),

  /**
   * チームに関するデータを JSONB で格納するカラムです。
   */
  data: jsonb(),
});
