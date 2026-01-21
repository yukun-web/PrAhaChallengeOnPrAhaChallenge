import type { Task, TaskId } from "../../domain";

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
};
