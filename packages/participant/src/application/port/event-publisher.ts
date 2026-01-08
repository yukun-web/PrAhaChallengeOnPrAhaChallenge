import type { ParticipantEvent } from "../../domain";

/**
 * 参加者ドメインイベントを発行するポートです。
 */
export type EventPublisher = {
  /**
   * 参加者イベントを発行します。
   *
   * @param event 発行するイベントです。
   * @throws {InfrastructureError} イベントの発行に失敗した場合にスローされます。
   */
  publish: (event: ParticipantEvent) => Promise<void>;
};
