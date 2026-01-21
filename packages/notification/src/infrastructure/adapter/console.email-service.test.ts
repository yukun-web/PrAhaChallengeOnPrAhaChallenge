import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { ConsoleEmailService } from "./console.email-service";

describe("ConsoleEmailService", () => {
  /**
   * テスト用の送信先メールアドレスです。
   */
  const TEST_TO = "test@example.com";

  /**
   * テスト用のメール件名です。
   */
  const TEST_SUBJECT = "テスト件名";

  /**
   * テスト用のメール本文です。
   */
  const TEST_BODY = "テスト本文です。";

  /**
   * console.log のスパイです。
   */
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test("メール送信時にコンソールにログを出力する", async () => {
    const emailService = ConsoleEmailService();

    await emailService.send({
      to: TEST_TO,
      subject: TEST_SUBJECT,
      body: TEST_BODY,
    });

    expect(consoleSpy).toHaveBeenCalledWith("[Email] 送信:", {
      to: TEST_TO,
      subject: TEST_SUBJECT,
      body: TEST_BODY,
    });
  });

  test("複数回呼び出しても正常に動作する", async () => {
    const emailService = ConsoleEmailService();

    await emailService.send({
      to: TEST_TO,
      subject: TEST_SUBJECT,
      body: TEST_BODY,
    });

    await emailService.send({
      to: "another@example.com",
      subject: "別の件名",
      body: "別の本文です。",
    });

    expect(consoleSpy).toHaveBeenCalledTimes(2);
  });
});
