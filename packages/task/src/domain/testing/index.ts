import { AssigneeId, Task, TaskId, TaskStatus } from "../task";

/**
 * テスト用のデフォルト課題IDです。
 */
const DEFAULT_TASK_ID = "87292b7f-ca43-4a41-b00f-7b73869d7026";

/**
 * テスト用のデフォルト担当者IDです。
 */
const DEFAULT_ASSIGNEE_ID = "f47ac10b-58cc-4372-a567-0e02b2c3d479";

/**
 * テスト用のダミー課題を作成するためのパラメータです。
 */
type CreateDummyTaskParams = {
  /**
   * 課題の識別子です。
   */
  id?: string;

  /**
   * 課題の担当者の識別子です。
   */
  assigneeId?: string;

  /**
   * 課題の進捗ステータスです。
   */
  status?: "NOT_STARTED" | "IN_PROGRESS" | "AWAITING_REVIEW" | "COMPLETED";
};

/**
 * テスト用のダミー課題を作成します。
 *
 * @param params ダミー課題のパラメータです。省略された場合はデフォルト値が使用されます。
 * @returns テスト用のダミー課題を返します。
 */
export const createDummyTask = (params?: CreateDummyTaskParams): Task => {
  return Task({
    id: TaskId(params?.id ?? DEFAULT_TASK_ID),
    assigneeId: AssigneeId(params?.assigneeId ?? DEFAULT_ASSIGNEE_ID),
    status: TaskStatus(params?.status ?? "NOT_STARTED"),
  });
};
