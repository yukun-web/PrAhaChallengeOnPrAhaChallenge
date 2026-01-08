import type { Mocked } from "vitest";
import { vi } from "vitest";

import type { ParticipantEventPublisher } from "./event-publisher.port";

/**
 * 参加者イベント発行ポートのモック実装です。
 */
export const participantEventPublisherMock: Mocked<ParticipantEventPublisher> = {
  /**
   * 参加者入会イベントを発行します。
   */
  publishEnrolled: vi.fn(),

  /**
   * 参加者休会イベントを発行します。
   */
  publishSuspended: vi.fn(),

  /**
   * 参加者復帰イベントを発行します。
   */
  publishReactivated: vi.fn(),

  /**
   * 参加者退会イベントを発行します。
   */
  publishWithdrawn: vi.fn(),
};
