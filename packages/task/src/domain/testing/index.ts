import type { Task } from "../task";
import { AssigneeId, TaskId, TaskStatus, Task as TaskConstructor } from "../task";

/**
 * テスト用のデフォルト課題IDです。
 */
const DEFAULT_TASK_ID = TaskId("87292b7f-ca43-4a41-b00f-7b73869d7026");

/**
 * テスト用のデフォルト担当者IDです。
 */
const DEFAULT_ASSIGNEE_ID = AssigneeId("f47ac10b-58cc-4372-a567-0e02b2c3d479");

/**
 * テスト用のダミー課題を作成します。
 *
 * @param params ダミー課題のパラメータです。省略された場合はデフォルト値が使用されます。
 * @returns テスト用のダミー課題を返します。
 */
export const createDummyTask = (params?: Partial<Task>): Task => {
  return TaskConstructor({
    id: params?.id ?? DEFAULT_TASK_ID,
    assigneeId: params?.assigneeId ?? DEFAULT_ASSIGNEE_ID,
    status: params?.status ?? TaskStatus.NOT_STARTED,
  });
};
