import { ValidationError } from "@ponp/fundamental";
import { describe, expect, test } from "vitest";

import { TaskId, TaskStatus } from "./task";

describe("TaskId", () => {
  /**
   * テストに使用する有効な UUID です。
   */
  const TEST_VALID_UUID = "87292b7f-ca43-4a41-b00f-7b73869d7026";

  /**
   * テストに使用する無効な UUID です。
   */
  const TEST_INVALID_UUID = "invalid-uuid";

  test("有効な UUID から生成できる", () => {
    const taskId = TaskId(TEST_VALID_UUID);

    expect(taskId).toBe(TEST_VALID_UUID);
  });

  test("無効な形式の場合は ValidationError をスローする", () => {
    expect(() => TaskId(TEST_INVALID_UUID)).toThrow(ValidationError);
  });

  test("generate() で新しい ID を生成できる", () => {
    const taskId = TaskId.generate();

    expect(taskId).toBeDefined();
    expect(typeof taskId).toBe("string");
    expect(taskId.length).toBe(36);
  });
});

describe("TaskStatus", () => {
  /**
   * テストに使用する有効なステータス値の一覧です。
   */
  const TEST_VALID_STATUSES = [
    "NOT_STARTED",
    "IN_PROGRESS",
    "AWAITING_REVIEW",
    "COMPLETED",
  ];

  /**
   * テストに使用する無効なステータス値です。
   */
  const TEST_INVALID_STATUS = "INVALID_STATUS";

  test.each(TEST_VALID_STATUSES)("有効なステータス '%s' から生成できる", (status) => {
    const taskStatus = TaskStatus(status);

    expect(taskStatus).toBe(status);
  });

  test("無効なステータス値の場合は ValidationError をスローする", () => {
    expect(() => TaskStatus(TEST_INVALID_STATUS)).toThrow(ValidationError);
  });

  test("4つの静的定数が定義されている", () => {
    expect(TaskStatus.NOT_STARTED).toBe("NOT_STARTED");
    expect(TaskStatus.IN_PROGRESS).toBe("IN_PROGRESS");
    expect(TaskStatus.AWAITING_REVIEW).toBe("AWAITING_REVIEW");
    expect(TaskStatus.COMPLETED).toBe("COMPLETED");
  });
});
