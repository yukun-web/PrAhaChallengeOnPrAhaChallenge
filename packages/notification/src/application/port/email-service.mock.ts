import type { Mocked } from "vitest";
import { vi } from "vitest";

import type { EmailService } from "./email-service";

/**
 * メール送信サービスのモック実装です。
 */
export const emailServiceMock: Mocked<EmailService> = {
  /**
   * メールを送信します。
   */
  send: vi.fn(),
};
