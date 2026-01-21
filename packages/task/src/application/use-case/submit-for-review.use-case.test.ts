import { DomainError, ValidationError } from "@ponp/fundamental";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { TaskStatus } from "../../domain";
import { createDummyTask } from "../../domain/testing";
import { eventPublisherMock } from "../port/event-publisher.mock";
import { taskRepositoryMock } from "../port/task.repository.mock";
import type { ExecuteSubmitForReviewUseCase } from "./submit-for-review.use-case";
import { createSubmitForReviewUseCase } from "./submit-for-review.use-case";

describe("課題レビュー提出ユースケース", () => {
  /**
   * テストに使用する未存在の課題 ID です。
   */
  const TEST_NOT_FOUND_TASK_ID = "2bc35053-b6d1-4f1f-8e8f-fca8b6b55a94";

  /**
   * テストに使用する不正な課題 ID です。
   */
  const TEST_INVALID_TASK_ID = "invalid-uuid";

  /**
   * テストに使用する不正なリクエスター ID です。
   */
  const TEST_INVALID_REQUESTER_ID = "invalid-uuid";

  /**
   * テストに使用する他人の ID です。
   */
  const TEST_OTHER_REQUESTER_ID = "c8d7e6f5-4321-4876-abcd-ef1234567890";

  /**
   * ユースケースの実行関数です。
   */
  let executeUseCase: ExecuteSubmitForReviewUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    executeUseCase = createSubmitForReviewUseCase({
      taskRepository: taskRepositoryMock,
      eventPublisher: eventPublisherMock,
    });
  });

  test("課題をレビュー待ち状態にして保存する", async () => {
    const task = createDummyTask({ status: TaskStatus.IN_PROGRESS });
    taskRepositoryMock.findById.mockResolvedValue(task);

    await executeUseCase({ taskId: task.id, requesterId: task.assigneeId });

    expect(taskRepositoryMock.save).toHaveBeenCalledExactlyOnceWith({
      ...task,
      status: TaskStatus.AWAITING_REVIEW,
    });
  });

  test("課題レビュー提出時にイベントを発行する", async () => {
    const task = createDummyTask({ status: TaskStatus.IN_PROGRESS });
    taskRepositoryMock.findById.mockResolvedValue(task);

    await executeUseCase({ taskId: task.id, requesterId: task.assigneeId });

    expect(eventPublisherMock.publish).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        taskId: task.id,
        assigneeId: task.assigneeId,
        submittedAt: expect.any(Date),
      }),
    );
  });

  test("存在しない課題 ID の場合はエラーを返し保存もイベント発行もしない", async () => {
    const task = createDummyTask();
    taskRepositoryMock.findById.mockResolvedValue(undefined);

    const act = () =>
      executeUseCase({ taskId: TEST_NOT_FOUND_TASK_ID, requesterId: task.assigneeId });

    await expect(act).rejects.toBeInstanceOf(DomainError);
    await expect(act).rejects.toMatchObject({ code: "TASK_NOT_FOUND" });
    expect(taskRepositoryMock.save).not.toHaveBeenCalled();
    expect(eventPublisherMock.publish).not.toHaveBeenCalled();
  });

  test("不正な課題 ID の場合はバリデーションエラーを返し保存もイベント発行もしない", async () => {
    const task = createDummyTask();

    const act = () => executeUseCase({ taskId: TEST_INVALID_TASK_ID, requesterId: task.assigneeId });

    await expect(act).rejects.toBeInstanceOf(ValidationError);
    expect(taskRepositoryMock.save).not.toHaveBeenCalled();
    expect(taskRepositoryMock.findById).not.toHaveBeenCalled();
    expect(eventPublisherMock.publish).not.toHaveBeenCalled();
  });

  test("不正なリクエスター ID の場合はバリデーションエラーを返し保存もイベント発行もしない", async () => {
    const task = createDummyTask();

    const act = () =>
      executeUseCase({ taskId: task.id, requesterId: TEST_INVALID_REQUESTER_ID });

    await expect(act).rejects.toBeInstanceOf(ValidationError);
    expect(taskRepositoryMock.save).not.toHaveBeenCalled();
    expect(taskRepositoryMock.findById).not.toHaveBeenCalled();
    expect(eventPublisherMock.publish).not.toHaveBeenCalled();
  });

  test("所有者でない場合はドメインエラーを返し保存もイベント発行もしない", async () => {
    const task = createDummyTask({ status: TaskStatus.IN_PROGRESS });
    taskRepositoryMock.findById.mockResolvedValue(task);

    const act = () =>
      executeUseCase({
        taskId: task.id,
        requesterId: TEST_OTHER_REQUESTER_ID,
      });

    await expect(act).rejects.toBeInstanceOf(DomainError);
    await expect(act).rejects.toMatchObject({ code: "STATUS_CHANGE_NOT_ALLOWED_FOR_NON_OWNER" });
    expect(taskRepositoryMock.save).not.toHaveBeenCalled();
    expect(eventPublisherMock.publish).not.toHaveBeenCalled();
  });

  test("取組中でない課題の場合はドメインエラーを返し保存もイベント発行もしない", async () => {
    const task = createDummyTask({ status: TaskStatus.NOT_STARTED });
    taskRepositoryMock.findById.mockResolvedValue(task);

    const act = () => executeUseCase({ taskId: task.id, requesterId: task.assigneeId });

    await expect(act).rejects.toBeInstanceOf(DomainError);
    await expect(act).rejects.toMatchObject({ code: "SUBMIT_FOR_REVIEW_NOT_ALLOWED" });
    expect(taskRepositoryMock.save).not.toHaveBeenCalled();
    expect(eventPublisherMock.publish).not.toHaveBeenCalled();
  });
});
