import type { EmailService, SendEmailParams } from "../../application/port/email-service";

/**
 * コンソールにメール内容を出力するメールサービスの実装です。
 *
 * @remarks
 * - 開発・テスト環境での利用を想定しています。
 * - 実際のメール送信は行わず、コンソールにログを出力します。
 *
 * @returns コンソール出力のメールサービスを返します。
 */
export const ConsoleEmailService = (): EmailService => ({
  /**
   * メール内容をコンソールに出力します。
   *
   * @param params 送信パラメータです。
   */
  async send(params: SendEmailParams): Promise<void> {
    console.log("[Email] 送信:", {
      to: params.to,
      subject: params.subject,
      body: params.body,
    });
  },
});
