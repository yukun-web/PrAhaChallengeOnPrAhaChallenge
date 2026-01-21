import { DomainError } from "@ponp/fundamental";

import { AssigneeId, Task, TaskId } from "../../domain";
import type { EventPublisher } from "../port/event-publisher";
import type { TaskRepository } from "../port/task.repository";

/**
 * 課題着手ユースケースが必要とする依存関係です。
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
 * 課題着手に必要なパラメータです。
 */
type StartProgressParams = {
  /**
   * 着手する課題の ID です。
   */
  taskId: string;

  /**
   * 操作要求者の ID です。
   */
  requesterId: string;
};

/**
 * 課題着手ユースケースの関数の型です。
 */
export type ExecuteStartProgressUseCase = (params: StartProgressParams) => Promise<void>;

/**
 * 課題着手ユースケースを作成します。
 *
 * @param dependencies 依存関係を指定します。
 * @returns 課題着手ユースケースを返します。
 */
export const createStartProgressUseCase = (
  dependencies: Dependencies,
): ExecuteStartProgressUseCase => {
  const { taskRepository, eventPublisher } = dependencies;

  /**
   * 課題の着手を扱うユースケースです。
   *
   * @param params 課題着手に必要なパラメータです。
   * @throws {ValidationError} 指定されたパラメータのいずれかが不正な場合にスローされます。
   * @throws {DomainError} 課題が存在しない場合、所有者でない場合、または着手できない状態の場合にスローされます。
   * @throws {InfrastructureError} 課題の取得・保存またはイベント発行に失敗した場合にスローされます。
   */
  const executeStartProgressUseCase = async (params: StartProgressParams) => {
    const id = TaskId(params.taskId);
    const requesterId = AssigneeId(params.requesterId);

    const task = await taskRepository.findById(id);

    if (!task) {
      throw new DomainError("指定した課題が存在しません。", { code: "TASK_NOT_FOUND" });
    }

    if (task.assigneeId !== requesterId) {
      throw new DomainError("課題の所有者のみが操作できます。", { code: "NOT_TASK_OWNER" });
    }

    const [startedTask, taskProgressStarted] = Task.startProgress(task);

    await taskRepository.save(startedTask);
    await eventPublisher.publish(taskProgressStarted);
  };

  return executeStartProgressUseCase;
};
