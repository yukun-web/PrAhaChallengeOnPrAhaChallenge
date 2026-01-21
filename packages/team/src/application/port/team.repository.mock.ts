import type { Mocked } from "vitest";
import { vi } from "vitest";

import type { TeamRepository } from "./team.repository";

/**
 * チームリポジトリのモック実装です。
 */
export const teamRepositoryMock: Mocked<TeamRepository> = {
  /**
   * チームを保存します。
   */
  save: vi.fn(),

  /**
   * ID からチームを取得します。
   */
  findById: vi.fn(),

  /**
   * チーム名からチームを取得します。
   */
  findByName: vi.fn(),
};
