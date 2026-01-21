import type { UnwrapNominalRecord } from "@ponp/fundamental";

import type { Task } from "./task";
import { AssigneeId, TaskId } from "./task";

/* ---- イベントタイプ定数 ---- */

/**
 * 課題ドメインイベントのタイプを表す定数です。
 */
export const TaskEventType = {
  CREATED: "TASK_CREATED",
  PROGRESS_STARTED: "TASK_PROGRESS_STARTED",
  SUBMITTED_FOR_REVIEW: "TASK_SUBMITTED_FOR_REVIEW",
  CHANGES_REQUESTED: "TASK_CHANGES_REQUESTED",
  COMPLETED: "TASK_COMPLETED",
} as const;

/* ---- 型 ---- */

/**
 * 課題が作成されたことを表すイベントです。
 */
export type TaskCreated = {
  /**
   * イベントのタイプです。
   */
  type: typeof TaskEventType.CREATED;

  /**
   * 作成された課題の識別子です。
   * @see TaskId
   */
  taskId: TaskId;

  /**
   * 課題の担当者の識別子です。
   * @see AssigneeId
   */
  assigneeId: AssigneeId;

  /**
   * 作成された日時です。
   */
  createdAt: Date;
};

/**
 * 課題に着手したことを表すイベントです。
 */
export type TaskProgressStarted = {
  /**
   * イベントのタイプです。
   */
  type: typeof TaskEventType.PROGRESS_STARTED;

  /**
   * 着手した課題の識別子です。
   * @see TaskId
   */
  taskId: TaskId;

  /**
   * 課題の担当者の識別子です。
   * @see AssigneeId
   */
  assigneeId: AssigneeId;

  /**
   * 着手した日時です。
   */
  startedAt: Date;
};

/**
 * 課題がレビューに提出されたことを表すイベントです。
 */
export type TaskSubmittedForReview = {
  /**
   * イベントのタイプです。
   */
  type: typeof TaskEventType.SUBMITTED_FOR_REVIEW;

  /**
   * 提出された課題の識別子です。
   * @see TaskId
   */
  taskId: TaskId;

  /**
   * 課題の担当者の識別子です。
   * @see AssigneeId
   */
  assigneeId: AssigneeId;

  /**
   * 提出した日時です。
   */
  submittedAt: Date;
};

/**
 * 課題に修正が依頼されたことを表すイベントです。
 */
export type TaskChangesRequested = {
  /**
   * イベントのタイプです。
   */
  type: typeof TaskEventType.CHANGES_REQUESTED;

  /**
   * 修正が依頼された課題の識別子です。
   * @see TaskId
   */
  taskId: TaskId;

  /**
   * 課題の担当者の識別子です。
   * @see AssigneeId
   */
  assigneeId: AssigneeId;

  /**
   * 修正が依頼された日時です。
   */
  requestedAt: Date;
};

/**
 * 課題が完了したことを表すイベントです。
 */
export type TaskCompleted = {
  /**
   * イベントのタイプです。
   */
  type: typeof TaskEventType.COMPLETED;

  /**
   * 完了した課題の識別子です。
   * @see TaskId
   */
  taskId: TaskId;

  /**
   * 課題の担当者の識別子です。
   * @see AssigneeId
   */
  assigneeId: AssigneeId;

  /**
   * 完了した日時です。
   */
  completedAt: Date;
};

/**
 * 課題コンテキストのすべてのドメインイベントのユニオンです。
 */
export type TaskEvent =
  | TaskCreated
  | TaskProgressStarted
  | TaskSubmittedForReview
  | TaskChangesRequested
  | TaskCompleted;

/* ---- ファクトリ関数 ---- */

/**
 * 課題作成イベントの再構築に必要なパラメータです。
 */
type TaskCreatedReconstructParams = UnwrapNominalRecord<TaskCreated>;

/**
 * 課題作成イベントのコンストラクタです。
 *
 * @param params 課題作成イベントのパラメータです。
 * @returns 課題作成イベントのインスタンスを返します。
 */
export const TaskCreated = (params: TaskCreated) => {
  return params;
};

/**
 * 課題作成イベントのファクトリ関数です。
 *
 * @param params 課題作成イベントの再構築に必要なパラメータです。
 * @returns 値オブジェクトに変換された課題作成イベントを返します。
 */
TaskCreated.reconstruct = (params: TaskCreatedReconstructParams): TaskCreated => {
  return TaskCreated({
    type: TaskEventType.CREATED,
    taskId: TaskId(params.taskId),
    assigneeId: AssigneeId(params.assigneeId),
    createdAt: params.createdAt,
  });
};

/**
 * 指定した課題に対する作成イベントを作成します。
 *
 * @param task 対象の課題です。
 * @returns 新しい作成イベントを返します。
 */
TaskCreated.create = (task: Task): TaskCreated => {
  return TaskCreated({
    type: TaskEventType.CREATED,
    taskId: task.id,
    assigneeId: task.assigneeId,
    createdAt: new Date(),
  });
};

/**
 * 課題着手イベントの再構築に必要なパラメータです。
 */
type TaskProgressStartedReconstructParams = UnwrapNominalRecord<TaskProgressStarted>;

/**
 * 課題着手イベントのコンストラクタです。
 *
 * @param params 課題着手イベントのパラメータです。
 * @returns 課題着手イベントのインスタンスを返します。
 */
export const TaskProgressStarted = (params: TaskProgressStarted) => {
  return params;
};

/**
 * 課題着手イベントのファクトリ関数です。
 *
 * @param params 課題着手イベントの再構築に必要なパラメータです。
 * @returns 値オブジェクトに変換された課題着手イベントを返します。
 */
TaskProgressStarted.reconstruct = (
  params: TaskProgressStartedReconstructParams,
): TaskProgressStarted => {
  return TaskProgressStarted({
    type: TaskEventType.PROGRESS_STARTED,
    taskId: TaskId(params.taskId),
    assigneeId: AssigneeId(params.assigneeId),
    startedAt: params.startedAt,
  });
};

/**
 * 指定した課題に対する着手イベントを作成します。
 *
 * @param task 対象の課題です。
 * @returns 新しい着手イベントを返します。
 */
TaskProgressStarted.create = (task: Task): TaskProgressStarted => {
  return TaskProgressStarted({
    type: TaskEventType.PROGRESS_STARTED,
    taskId: task.id,
    assigneeId: task.assigneeId,
    startedAt: new Date(),
  });
};

/**
 * 課題レビュー提出イベントの再構築に必要なパラメータです。
 */
type TaskSubmittedForReviewReconstructParams = UnwrapNominalRecord<TaskSubmittedForReview>;

/**
 * 課題レビュー提出イベントのコンストラクタです。
 *
 * @param params 課題レビュー提出イベントのパラメータです。
 * @returns 課題レビュー提出イベントのインスタンスを返します。
 */
export const TaskSubmittedForReview = (params: TaskSubmittedForReview) => {
  return params;
};

/**
 * 課題レビュー提出イベントのファクトリ関数です。
 *
 * @param params 課題レビュー提出イベントの再構築に必要なパラメータです。
 * @returns 値オブジェクトに変換された課題レビュー提出イベントを返します。
 */
TaskSubmittedForReview.reconstruct = (
  params: TaskSubmittedForReviewReconstructParams,
): TaskSubmittedForReview => {
  return TaskSubmittedForReview({
    type: TaskEventType.SUBMITTED_FOR_REVIEW,
    taskId: TaskId(params.taskId),
    assigneeId: AssigneeId(params.assigneeId),
    submittedAt: params.submittedAt,
  });
};

/**
 * 指定した課題に対するレビュー提出イベントを作成します。
 *
 * @param task 対象の課題です。
 * @returns 新しいレビュー提出イベントを返します。
 */
TaskSubmittedForReview.create = (task: Task): TaskSubmittedForReview => {
  return TaskSubmittedForReview({
    type: TaskEventType.SUBMITTED_FOR_REVIEW,
    taskId: task.id,
    assigneeId: task.assigneeId,
    submittedAt: new Date(),
  });
};

/**
 * 課題修正依頼イベントの再構築に必要なパラメータです。
 */
type TaskChangesRequestedReconstructParams = UnwrapNominalRecord<TaskChangesRequested>;

/**
 * 課題修正依頼イベントのコンストラクタです。
 *
 * @param params 課題修正依頼イベントのパラメータです。
 * @returns 課題修正依頼イベントのインスタンスを返します。
 */
export const TaskChangesRequested = (params: TaskChangesRequested) => {
  return params;
};

/**
 * 課題修正依頼イベントのファクトリ関数です。
 *
 * @param params 課題修正依頼イベントの再構築に必要なパラメータです。
 * @returns 値オブジェクトに変換された課題修正依頼イベントを返します。
 */
TaskChangesRequested.reconstruct = (
  params: TaskChangesRequestedReconstructParams,
): TaskChangesRequested => {
  return TaskChangesRequested({
    type: TaskEventType.CHANGES_REQUESTED,
    taskId: TaskId(params.taskId),
    assigneeId: AssigneeId(params.assigneeId),
    requestedAt: params.requestedAt,
  });
};

/**
 * 指定した課題に対する修正依頼イベントを作成します。
 *
 * @param task 対象の課題です。
 * @returns 新しい修正依頼イベントを返します。
 */
TaskChangesRequested.create = (task: Task): TaskChangesRequested => {
  return TaskChangesRequested({
    type: TaskEventType.CHANGES_REQUESTED,
    taskId: task.id,
    assigneeId: task.assigneeId,
    requestedAt: new Date(),
  });
};

/**
 * 課題完了イベントの再構築に必要なパラメータです。
 */
type TaskCompletedReconstructParams = UnwrapNominalRecord<TaskCompleted>;

/**
 * 課題完了イベントのコンストラクタです。
 *
 * @param params 課題完了イベントのパラメータです。
 * @returns 課題完了イベントのインスタンスを返します。
 */
export const TaskCompleted = (params: TaskCompleted) => {
  return params;
};

/**
 * 課題完了イベントのファクトリ関数です。
 *
 * @param params 課題完了イベントの再構築に必要なパラメータです。
 * @returns 値オブジェクトに変換された課題完了イベントを返します。
 */
TaskCompleted.reconstruct = (params: TaskCompletedReconstructParams): TaskCompleted => {
  return TaskCompleted({
    type: TaskEventType.COMPLETED,
    taskId: TaskId(params.taskId),
    assigneeId: AssigneeId(params.assigneeId),
    completedAt: params.completedAt,
  });
};

/**
 * 指定した課題に対する完了イベントを作成します。
 *
 * @param task 対象の課題です。
 * @returns 新しい完了イベントを返します。
 */
TaskCompleted.create = (task: Task): TaskCompleted => {
  return TaskCompleted({
    type: TaskEventType.COMPLETED,
    taskId: task.id,
    assigneeId: task.assigneeId,
    completedAt: new Date(),
  });
};
