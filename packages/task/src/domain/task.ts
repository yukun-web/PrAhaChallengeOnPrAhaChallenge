import type { UnwrapNominalRecord } from "@ponp/fundamental";
import {
  assert,
  assertIncludes,
  assertUUID,
  DomainError,
  type Nominal,
  uuid,
  ValidationError,
} from "@ponp/fundamental";

import {
  TaskChangesRequested,
  TaskCompleted,
  TaskCreated,
  TaskProgressStarted,
  TaskSubmittedForReview,
} from "./events";

/* ---- 型 ---- */

/**
 * 課題の識別子です。
 */
export type TaskId = Nominal<string, "TaskId">;

/**
 * 課題の担当者の識別子です。
 */
export type AssigneeId = Nominal<string, "AssigneeId">;

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
 * 課題の担当者の識別子のファクトリ関数です。
 *
 * @param value 課題の担当者の識別子の文字列です。
 * @returns 指定された文字列が課題の担当者の識別子として有効であれば、その文字列を公称型にして返します。
 * @throws {ValidationError} 指定された文字列が課題の担当者の識別子の形式と一致しない場合にスローされます。
 */
export const AssigneeId = (value: string): AssigneeId => {
  const invalidFormatError = new ValidationError({
    code: "INVALID_ASSIGNEE_ID_FORMAT",
    field: "AssigneeId",
    value,
  });
  assertUUID(value, invalidFormatError);

  return value as AssigneeId;
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

/* ---- エンティティ ---- */

/**
 * 課題です。
 */
export type Task = {
  /**
   * 課題の識別子です。
   */
  id: TaskId;

  /**
   * 課題の担当者の識別子です。
   */
  assigneeId: AssigneeId;

  /**
   * 課題の進捗ステータスです。
   */
  status: TaskStatus;
};

/**
 * 課題のコンストラクターです。
 */
export const Task = (params: Task) => {
  return params;
};

/**
 * 課題の再構築に必要なパラメータです。
 */
export type ReconstructTaskParams = UnwrapNominalRecord<Task>;

/**
 * 課題を再構築するための関数です。
 *
 * @param params 課題の再構築に必要なパラメータです。
 * @returns 指定されたパラメータの課題を返します。
 * @throws {ValidationError} 指定されたプロパティのいずれかが不正な場合にスローされます。
 * @remarks この関数はリポジトリでのみ使用し、アプリケーション層では用途にあったメソッドを使用してください。
 */
Task.reconstruct = (params: ReconstructTaskParams): Task => {
  return Task({
    id: TaskId(params.id),
    assigneeId: AssigneeId(params.assigneeId),
    status: TaskStatus(params.status),
  });
};

/**
 * 課題の作成に必要なパラメータです。
 */
export type CreateTaskParams = Omit<Task, "id" | "status">;

/**
 * 課題を作成します。
 *
 * @param params 課題の作成に必要なパラメータです。
 * @returns 作成された課題と作成イベントを返します。
 */
Task.create = (params: CreateTaskParams): [Task, TaskCreated] => {
  const task = Task({
    id: TaskId.generate(),
    assigneeId: params.assigneeId,
    status: TaskStatus.NOT_STARTED,
  });

  const taskCreated = TaskCreated.create(task);

  return [task, taskCreated];
};

/**
 * 課題に着手します。
 *
 * @param task 着手する課題です。
 * @returns 取組中状態の課題と着手イベントを返します。
 * @throws {DomainError} 課題が未着手状態でない場合にスローされます。
 */
Task.startProgress = (task: Task): [Task, TaskProgressStarted] => {
  const notAllowedError = new DomainError("未着手の課題のみ着手できます。", {
    code: "START_PROGRESS_NOT_ALLOWED",
  });
  assert(Task.isNotStarted(task), notAllowedError);

  const started = Task({
    ...task,
    status: TaskStatus.IN_PROGRESS,
  });

  const taskProgressStarted = TaskProgressStarted.create(started);

  return [started, taskProgressStarted];
};

/**
 * 課題をレビューに提出します。
 *
 * @param task レビューに提出する課題です。
 * @returns レビュー待ち状態の課題と提出イベントを返します。
 * @throws {DomainError} 課題が取組中状態でない場合にスローされます。
 */
Task.submitForReview = (task: Task): [Task, TaskSubmittedForReview] => {
  const notAllowedError = new DomainError("取組中の課題のみレビューに提出できます。", {
    code: "SUBMIT_FOR_REVIEW_NOT_ALLOWED",
  });
  assert(Task.isInProgress(task), notAllowedError);

  const submitted = Task({
    ...task,
    status: TaskStatus.AWAITING_REVIEW,
  });

  const taskSubmittedForReview = TaskSubmittedForReview.create(submitted);

  return [submitted, taskSubmittedForReview];
};

/**
 * 課題に修正を依頼します。
 *
 * @param task 修正を依頼する課題です。
 * @returns 取組中状態の課題と修正依頼イベントを返します。
 * @throws {DomainError} 課題がレビュー待ち状態でない場合にスローされます。
 */
Task.requestChanges = (task: Task): [Task, TaskChangesRequested] => {
  const notAllowedError = new DomainError("レビュー待ちの課題のみ修正を依頼できます。", {
    code: "REQUEST_CHANGES_NOT_ALLOWED",
  });
  assert(Task.isAwaitingReview(task), notAllowedError);

  const changesRequested = Task({
    ...task,
    status: TaskStatus.IN_PROGRESS,
  });

  const taskChangesRequested = TaskChangesRequested.create(changesRequested);

  return [changesRequested, taskChangesRequested];
};

/**
 * 課題を完了します。
 *
 * @param task 完了する課題です。
 * @returns 完了状態の課題と完了イベントを返します。
 * @throws {DomainError} 課題がレビュー待ち状態でない場合にスローされます。
 */
Task.complete = (task: Task): [Task, TaskCompleted] => {
  const notAllowedError = new DomainError("レビュー待ちの課題のみ完了できます。", {
    code: "COMPLETE_NOT_ALLOWED",
  });
  assert(Task.isAwaitingReview(task), notAllowedError);

  const completed = Task({
    ...task,
    status: TaskStatus.COMPLETED,
  });

  const taskCompleted = TaskCompleted.create(completed);

  return [completed, taskCompleted];
};

/**
 * 課題が未着手かどうかを判定します。
 *
 * @param task 判定する課題です。
 * @returns 課題が未着手の場合は true を、そうでない場合は false を返します。
 */
Task.isNotStarted = (task: Task): boolean => {
  return task.status === TaskStatus.NOT_STARTED;
};

/**
 * 課題が取組中かどうかを判定します。
 *
 * @param task 判定する課題です。
 * @returns 課題が取組中の場合は true を、そうでない場合は false を返します。
 */
Task.isInProgress = (task: Task): boolean => {
  return task.status === TaskStatus.IN_PROGRESS;
};

/**
 * 課題がレビュー待ちかどうかを判定します。
 *
 * @param task 判定する課題です。
 * @returns 課題がレビュー待ちの場合は true を、そうでない場合は false を返します。
 */
Task.isAwaitingReview = (task: Task): boolean => {
  return task.status === TaskStatus.AWAITING_REVIEW;
};

/**
 * 課題が完了かどうかを判定します。
 *
 * @param task 判定する課題です。
 * @returns 課題が完了の場合は true を、そうでない場合は false を返します。
 */
Task.isCompleted = (task: Task): boolean => {
  return task.status === TaskStatus.COMPLETED;
};
