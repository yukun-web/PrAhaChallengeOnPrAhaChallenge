import type { Mocked } from "vitest";
import { vi } from "vitest";

import type { TaskRepository } from "./task.repository";

/**
 * 課題リポジトリのモック実装です。
 */
export const taskRepositoryMock: Mocked<TaskRepository> = {
  /**
   * 課題を保存します。
   */
  save: vi.fn(),

  /**
   * ID から課題を取得します。
   */
  findById: vi.fn(),
};
