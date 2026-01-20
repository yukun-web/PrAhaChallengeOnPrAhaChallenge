import {
  assertIncludes,
  assertUUID,
  type Nominal,
  uuid,
  ValidationError,
} from "@ponp/fundamental";

/* ---- 型 ---- */

/**
 * 課題の識別子です。
 */
export type TaskId = Nominal<string, "TaskId">;

/**
 * 課題の進捗ステータスです。
 *
 * @remarks
 * - NOT_STARTED: 未着手
 * - IN_PROGRESS: 取組中
 * - AWAITING_REVIEW: レビュー待ち
 * - COMPLETED: 完了
 */
export type TaskStatus = Nominal<
  "NOT_STARTED" | "IN_PROGRESS" | "AWAITING_REVIEW" | "COMPLETED",
  "TaskStatus"
>;

/* ---- 定数 ---- */

/**
 * 有効な課題ステータスの一覧です。
 */
const VALID_TASK_STATUSES = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "AWAITING_REVIEW",
  "COMPLETED",
] as const;

/* ---- ファクトリ関数 ---- */

/**
 * 課題の識別子のファクトリ関数です。
 *
 * @param value 課題の識別子の文字列です。
 * @returns 指定された文字列が課題の識別子として有効であれば、その文字列を公称型にして返します。
 * @throws {ValidationError} 指定された文字列が課題の識別子の形式と一致しない場合にスローされます。
 */
export const TaskId = (value: string): TaskId => {
  const invalidFormatError = new ValidationError({
    code: "INVALID_TASK_ID_FORMAT",
    field: "TaskId",
    value,
  });
  assertUUID(value, invalidFormatError);

  return value as TaskId;
};

/**
 * 新しい課題の識別子をランダムな UUID から生成します。
 *
 * @returns 新しい課題の識別子を返します。
 */
TaskId.generate = () => {
  return TaskId(uuid());
};

/**
 * 課題の進捗ステータスのファクトリ関数です。
 *
 * @param value 課題の進捗ステータスの文字列です。
 * @returns 指定された文字列が課題の進捗ステータスとして有効であれば、その文字列を公称型にして返します。
 * @throws {ValidationError} 指定された文字列が有効な課題の進捗ステータスでない場合にスローされます。
 */
export const TaskStatus = (value: string): TaskStatus => {
  const invalidStatusError = new ValidationError({
    code: "INVALID_TASK_STATUS",
    field: "TaskStatus",
    value,
  });
  assertIncludes([...VALID_TASK_STATUSES], value, invalidStatusError);

  return value as TaskStatus;
};

/**
 * 未着手のステータスです。
 */
TaskStatus.NOT_STARTED = TaskStatus("NOT_STARTED");

/**
 * 取組中のステータスです。
 */
TaskStatus.IN_PROGRESS = TaskStatus("IN_PROGRESS");

/**
 * レビュー待ちのステータスです。
 */
TaskStatus.AWAITING_REVIEW = TaskStatus("AWAITING_REVIEW");

/**
 * 完了のステータスです。
 */
TaskStatus.COMPLETED = TaskStatus("COMPLETED");
