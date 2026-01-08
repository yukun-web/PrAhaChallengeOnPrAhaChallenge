import type { Mocked } from "vitest";
import { vi } from "vitest";

import type { EventPublisher } from "./event-publisher";

/**
 * 参加者イベント発行ポートのモック実装です。
 */
export const eventPublisherMock: Mocked<EventPublisher> = {
  /**
   * 参加者イベントを発行します。
   */
  publish: vi.fn(),
};
