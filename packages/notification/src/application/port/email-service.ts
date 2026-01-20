/**
 * メール送信に必要なパラメータです。
 */
export type SendEmailParams = {
  /**
   * 送信先のメールアドレスです。
   */
  to: string;

  /**
   * メールの件名です。
   */
  subject: string;

  /**
   * メールの本文です。
   */
  body: string;
};

/**
 * メール送信サービスのインターフェースです。
 *
 * @remarks
 * - 実際のメール送信は infrastructure 層のアダプタで実装します。
 */
export type EmailService = {
  /**
   * メールを送信します。
   *
   * @param params 送信パラメータです。
   * @throws {InfrastructureError} 送信に失敗した場合にスローされます。
   */
  send: (params: SendEmailParams) => Promise<void>;
};
