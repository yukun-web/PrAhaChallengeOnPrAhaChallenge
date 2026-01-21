import type { Mocked } from "vitest";
import { vi } from "vitest";

import type { EventPublisher } from "./event-publisher";

/**
 * 課題イベント発行ポートのモック実装です。
 */
export const eventPublisherMock: Mocked<EventPublisher> = {
  /**
   * 課題イベントを発行します。
   */
  publish: vi.fn(),
};
