import type { EmailService } from "./application";
import { ConsoleEmailService } from "./infrastructure";

/**
 * 通知モジュールの依存関係です。
 */
type NotificationModuleDependencies = {
  /**
   * メール送信サービスです。
   *
   * @remarks
   * - 省略した場合は ConsoleEmailService が使用されます。
   */
  emailService?: EmailService;
};

/**
 * 通知モジュールの操作関数をまとめた型です。
 */
export type NotificationModule = {
  /**
   * メール送信サービスです。
   */
  emailService: EmailService;
};

/**
 * 通知モジュールを作成します。
 *
 * @param dependencies 依存関係を指定します。
 * @returns 通知モジュールを返します。
 */
export const createNotificationModule = (
  dependencies: NotificationModuleDependencies = {},
): NotificationModule => {
  const emailService = dependencies.emailService ?? ConsoleEmailService();

  return {
    emailService,
  };
};

export type { EmailService, SendEmailParams } from "./application";
export { emailServiceMock } from "./application";
export { ConsoleEmailService } from "./infrastructure";
