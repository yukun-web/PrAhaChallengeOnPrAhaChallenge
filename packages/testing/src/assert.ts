import type { AggregateTable, Database } from "@ponp/fundamental";
import { expect } from "vitest";

import { getRecordById } from "./db";

/**
 * 値が undefined でないことを検証します。
 *
 * @param value 検証する値を指定します。
 */
export function assertNotUndefined<T>(value: T): asserts value is Exclude<T, undefined> {
  expect(value).not.toBeUndefined();
}

/**
 * 指定したテーブルに、指定した値のレコードが存在するかを検証します。
 *
 * @param db 調査対象のデータベースです。
 * @param table 調査対象のテーブルです。
 * @param expectedRecord 存在をチェックするレコードです。
 */
export async function assertRecordExists<T extends { id: string }>(
  db: Database,
  table: AggregateTable,
  expectedRecord: T,
): Promise<void> {
  const record = await getRecordById(db, table, expectedRecord.id);

  assertNotUndefined(record);
  expect(record.data).deep.equals(expectedRecord);
}
