import type { Mocked } from "vitest";
import { vi } from "vitest";

import type { ParticipantRepository } from "./participant.repository";

/**
 * 参加者リポジトリのモック実装です。
 */
export const participantRepositoryMock: Mocked<ParticipantRepository> = {
  /**
   * 参加者を保存します。
   */
  save: vi.fn(),

  /**
   * ID から参加者を取得します。
   */
  findById: vi.fn(),

  /**
   * メールアドレスから参加者を取得します。
   */
  findByEmail: vi.fn(),
};
