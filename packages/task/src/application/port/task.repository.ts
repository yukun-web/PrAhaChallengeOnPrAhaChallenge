import type { AssigneeId, Task, TaskId } from "../../domain";

/**
 * 課題リポジトリのインターフェースです。
 */
export type TaskRepository = {
  /**
   * 課題を保存します。
   *
   * @param task 保存する課題です。
   * @throws {InfrastructureError} 保存に失敗した場合はエラーをスローします。
   */
  save: (task: Task) => Promise<void>;

  /**
   * ID から課題を取得します。
   *
   * @param id 検索する課題の ID です。
   * @returns 見つかった場合は課題を、存在しない場合は undefined を返します。
   * @throws {InfrastructureError} 取得に失敗した場合はエラーをスローします。
   */
  findById: (id: TaskId) => Promise<Task | undefined>;

  /**
   * 担当者 ID から課題一覧を取得します。
   *
   * @param assigneeId 検索する担当者の ID です。
   * @returns 担当者に紐づく課題の一覧を返します。
   * @throws {InfrastructureError} 取得に失敗した場合はエラーをスローします。
   */
  findByAssigneeId: (assigneeId: AssigneeId) => Promise<Task[]>;

  /**
   * 課題を削除します。
   *
   * @param id 削除する課題の ID です。
   * @throws {InfrastructureError} 削除に失敗した場合はエラーをスローします。
   */
  delete: (id: TaskId) => Promise<void>;
};
