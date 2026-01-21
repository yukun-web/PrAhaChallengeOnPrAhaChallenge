import { DomainError, ValidationError } from "@ponp/fundamental";
import { spyUuid } from "@ponp/testing";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { TaskEventType } from "./events";
import { AssigneeId, Task, TaskId, TaskStatus } from "./task";
import { createDummyTask } from "./testing";

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

describe("AssigneeId", () => {
  /**
   * テストに使用する有効な UUID です。
   */
  const TEST_VALID_UUID = "f47ac10b-58cc-4372-a567-0e02b2c3d479";

  /**
   * テストに使用する無効な UUID です。
   */
  const TEST_INVALID_UUID = "invalid-uuid";

  test("有効な UUID から生成できる", () => {
    const assigneeId = AssigneeId(TEST_VALID_UUID);

    expect(assigneeId).toBe(TEST_VALID_UUID);
  });

  test("無効な形式の場合は ValidationError をスローする", () => {
    expect(() => AssigneeId(TEST_INVALID_UUID)).toThrow(ValidationError);
  });
});

describe("Task", () => {
  /**
   * テストに使用する課題IDです。
   */
  const TEST_TASK_ID = "87292b7f-ca43-4a41-b00f-7b73869d7026";

  /**
   * テストに使用する担当者IDです。
   */
  const TEST_ASSIGNEE_ID = "f47ac10b-58cc-4372-a567-0e02b2c3d479";

  /**
   * テストに使用する非所有者のIDです。
   *
   * @remarks
   * - 00000000-0000-0000-0000-000000000000 は NullObject 用に予約されています。
   */
  const TEST_NON_OWNER_ASSIGNEE_ID = "a1111111-1111-4111-8111-111111111111";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Task.create", () => {
    test("課題を作成すると未着手状態で作成される", () => {
      spyUuid(TEST_TASK_ID);
      const assigneeId = AssigneeId(TEST_ASSIGNEE_ID);

      const [task, event] = Task.create({ assigneeId });

      expect(task.id).toBe(TEST_TASK_ID);
      expect(task.assigneeId).toBe(TEST_ASSIGNEE_ID);
      expect(task.status).toBe(TaskStatus.NOT_STARTED);
      expect(event.type).toBe(TaskEventType.CREATED);
      expect(event.taskId).toBe(TEST_TASK_ID);
      expect(event.assigneeId).toBe(TEST_ASSIGNEE_ID);
    });
  });

  describe("Task.reconstruct", () => {
    test("パラメータから課題を再構築できる", () => {
      const task = Task.reconstruct({
        id: TEST_TASK_ID,
        assigneeId: TEST_ASSIGNEE_ID,
        status: "IN_PROGRESS",
      });

      expect(task.id).toBe(TEST_TASK_ID);
      expect(task.assigneeId).toBe(TEST_ASSIGNEE_ID);
      expect(task.status).toBe(TaskStatus.IN_PROGRESS);
    });
  });

  describe("Task.startProgress", () => {
    test("未着手の課題に着手できる", () => {
      const task = createDummyTask({ status: TaskStatus.NOT_STARTED });

      const [started, event] = Task.startProgress(task, task.assigneeId);

      expect(started.status).toBe(TaskStatus.IN_PROGRESS);
      expect(event.type).toBe(TaskEventType.PROGRESS_STARTED);
    });

    test("未着手でない課題に着手しようとすると DomainError をスローする", () => {
      const task = createDummyTask({ status: TaskStatus.IN_PROGRESS });

      expect(() => Task.startProgress(task, task.assigneeId)).toThrow(DomainError);
    });

    test("課題の所有者でない場合は DomainError をスローする", () => {
      const task = createDummyTask({ status: TaskStatus.NOT_STARTED });
      const nonOwnerActorId = AssigneeId(TEST_NON_OWNER_ASSIGNEE_ID);

      expect(() => Task.startProgress(task, nonOwnerActorId)).toThrow(DomainError);
    });
  });

  describe("Task.submitForReview", () => {
    test("取組中の課題をレビューに提出できる", () => {
      const task = createDummyTask({ status: TaskStatus.IN_PROGRESS });

      const [submitted, event] = Task.submitForReview(task, task.assigneeId);

      expect(submitted.status).toBe(TaskStatus.AWAITING_REVIEW);
      expect(event.type).toBe(TaskEventType.SUBMITTED_FOR_REVIEW);
    });

    test("取組中でない課題をレビューに提出しようとすると DomainError をスローする", () => {
      const task = createDummyTask({ status: TaskStatus.NOT_STARTED });

      expect(() => Task.submitForReview(task, task.assigneeId)).toThrow(DomainError);
    });

    test("課題の所有者でない場合は DomainError をスローする", () => {
      const task = createDummyTask({ status: TaskStatus.IN_PROGRESS });
      const nonOwnerActorId = AssigneeId(TEST_NON_OWNER_ASSIGNEE_ID);

      expect(() => Task.submitForReview(task, nonOwnerActorId)).toThrow(DomainError);
    });
  });

  describe("Task.requestChanges", () => {
    test("レビュー待ちの課題に修正を依頼できる", () => {
      const task = createDummyTask({ status: TaskStatus.AWAITING_REVIEW });

      const [changesRequested, event] = Task.requestChanges(task, task.assigneeId);

      expect(changesRequested.status).toBe(TaskStatus.IN_PROGRESS);
      expect(event.type).toBe(TaskEventType.CHANGES_REQUESTED);
    });

    test("レビュー待ちでない課題に修正を依頼しようとすると DomainError をスローする", () => {
      const task = createDummyTask({ status: TaskStatus.IN_PROGRESS });

      expect(() => Task.requestChanges(task, task.assigneeId)).toThrow(DomainError);
    });

    test("課題の所有者でない場合は DomainError をスローする", () => {
      const task = createDummyTask({ status: TaskStatus.AWAITING_REVIEW });
      const nonOwnerActorId = AssigneeId(TEST_NON_OWNER_ASSIGNEE_ID);

      expect(() => Task.requestChanges(task, nonOwnerActorId)).toThrow(DomainError);
    });
  });

  describe("Task.complete", () => {
    test("レビュー待ちの課題を完了できる", () => {
      const task = createDummyTask({ status: TaskStatus.AWAITING_REVIEW });

      const [completed, event] = Task.complete(task, task.assigneeId);

      expect(completed.status).toBe(TaskStatus.COMPLETED);
      expect(event.type).toBe(TaskEventType.COMPLETED);
    });

    test("レビュー待ちでない課題を完了しようとすると DomainError をスローする", () => {
      const task = createDummyTask({ status: TaskStatus.IN_PROGRESS });

      expect(() => Task.complete(task, task.assigneeId)).toThrow(DomainError);
    });

    test("完了済みの課題は変更できない", () => {
      const task = createDummyTask({ status: TaskStatus.COMPLETED });

      expect(() => Task.complete(task, task.assigneeId)).toThrow(DomainError);
    });

    test("課題の所有者でない場合は DomainError をスローする", () => {
      const task = createDummyTask({ status: TaskStatus.AWAITING_REVIEW });
      const nonOwnerActorId = AssigneeId(TEST_NON_OWNER_ASSIGNEE_ID);

      expect(() => Task.complete(task, nonOwnerActorId)).toThrow(DomainError);
    });
  });

  describe("状態判定メソッド", () => {
    test("isNotStarted は未着手の場合に true を返す", () => {
      const task = createDummyTask({ status: TaskStatus.NOT_STARTED });

      expect(Task.isNotStarted(task)).toBe(true);
      expect(Task.isInProgress(task)).toBe(false);
      expect(Task.isAwaitingReview(task)).toBe(false);
      expect(Task.isCompleted(task)).toBe(false);
    });

    test("isInProgress は取組中の場合に true を返す", () => {
      const task = createDummyTask({ status: TaskStatus.IN_PROGRESS });

      expect(Task.isNotStarted(task)).toBe(false);
      expect(Task.isInProgress(task)).toBe(true);
      expect(Task.isAwaitingReview(task)).toBe(false);
      expect(Task.isCompleted(task)).toBe(false);
    });

    test("isAwaitingReview はレビュー待ちの場合に true を返す", () => {
      const task = createDummyTask({ status: TaskStatus.AWAITING_REVIEW });

      expect(Task.isNotStarted(task)).toBe(false);
      expect(Task.isInProgress(task)).toBe(false);
      expect(Task.isAwaitingReview(task)).toBe(true);
      expect(Task.isCompleted(task)).toBe(false);
    });

    test("isCompleted は完了の場合に true を返す", () => {
      const task = createDummyTask({ status: TaskStatus.COMPLETED });

      expect(Task.isNotStarted(task)).toBe(false);
      expect(Task.isInProgress(task)).toBe(false);
      expect(Task.isAwaitingReview(task)).toBe(false);
      expect(Task.isCompleted(task)).toBe(true);
    });
  });
});
