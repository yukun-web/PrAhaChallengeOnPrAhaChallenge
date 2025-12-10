import type { Mocked } from "vitest";
import { vi } from "vitest";

import type { ParticipantRepository } from "../../application/port/participant.repository";

/**
 * 参加者リポジトリのモック実装です。
 */
export const mockParticipantRepository: Mocked<ParticipantRepository> = {
  /**
   * 参加者を保存します。
   */
  save: vi.fn(),
};
