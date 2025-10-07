import { jsonb, pgSchema, varchar } from "drizzle-orm/pg-core";

/**
 * 参加者コンテキストのデータを格納するスキーマです。
 */
export const participantSchema = pgSchema("participant");

/**
 * 参加者テーブルです。
 */
export const participantsTable = participantSchema.table("participants", {
  /**
   * 参加者IDです。
   */
  id: varchar({ length: 36 }).primaryKey(),

  /**
   * 参加者に関するデータを JSONB で格納するカラムです。
   */
  data: jsonb(),
});
