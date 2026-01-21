import type { TaskEvent } from "../../domain";

/**
 * 課題ドメインイベントを発行するポートです。
 */
export type EventPublisher = {
  /**
   * 課題イベントを発行します。
   *
   * @param event 発行するイベントです。
   * @throws {InfrastructureError} イベントの発行に失敗した場合にスローされます。
   */
  publish: (event: TaskEvent) => Promise<void>;
};
