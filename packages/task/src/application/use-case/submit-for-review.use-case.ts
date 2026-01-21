import { DomainError } from "@ponp/fundamental";

import { AssigneeId, Task, TaskId } from "../../domain";
import type { EventPublisher } from "../port/event-publisher";
import type { TaskRepository } from "../port/task.repository";

/**
 * 課題レビュー提出ユースケースが必要とする依存関係です。
 */
type Dependencies = {
  /**
   * 課題を保存・取得するリポジトリの関数です。
   * @see TaskRepository
   */
  taskRepository: TaskRepository;

  /**
   * 課題イベントを発行するパブリッシャーです。
   * @see EventPublisher
   */
  eventPublisher: EventPublisher;
};

/**
 * 課題レビュー提出に必要なパラメータです。
 */
type SubmitForReviewParams = {
  /**
   * 提出する課題の ID です。
   */
  taskId: string;

  /**
   * 操作要求者の ID です。
   */
  requesterId: string;
};

/**
 * 課題レビュー提出ユースケースの関数の型です。
 */
export type ExecuteSubmitForReviewUseCase = (params: SubmitForReviewParams) => Promise<void>;

/**
 * 課題レビュー提出ユースケースを作成します。
 *
 * @param dependencies 依存関係を指定します。
 * @returns 課題レビュー提出ユースケースを返します。
 */
export const createSubmitForReviewUseCase = (
  dependencies: Dependencies,
): ExecuteSubmitForReviewUseCase => {
  const { taskRepository, eventPublisher } = dependencies;

  /**
   * 課題のレビュー提出を扱うユースケースです。
   *
   * @param params 課題レビュー提出に必要なパラメータです。
   * @throws {ValidationError} 指定されたパラメータのいずれかが不正な場合にスローされます。
   * @throws {DomainError} 課題が存在しない場合、所有者でない場合、または提出できない状態の場合にスローされます。
   * @throws {InfrastructureError} 課題の取得・保存またはイベント発行に失敗した場合にスローされます。
   */
  const executeSubmitForReviewUseCase = async (params: SubmitForReviewParams) => {
    const id = TaskId(params.taskId);
    const requesterId = AssigneeId(params.requesterId);

    const task = await taskRepository.findById(id);

    if (!task) {
      throw new DomainError("指定した課題が存在しません。", { code: "TASK_NOT_FOUND" });
    }

    const [submittedTask, taskSubmittedForReview] = Task.submitForReview(task, requesterId);

    await taskRepository.save(submittedTask);
    await eventPublisher.publish(taskSubmittedForReview);
  };

  return executeSubmitForReviewUseCase;
};
