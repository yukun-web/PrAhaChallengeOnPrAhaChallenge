import type {
  ParticipantEnrolled,
  ParticipantReactivated,
  ParticipantSuspended,
  ParticipantWithdrawn,
} from "../../domain";

/**
 * 参加者ドメインイベントを発行するポートです。
 */
export type ParticipantEventPublisher = {
  /**
   * 参加者入会イベントを発行します。
   *
   * @param event 発行する入会イベントです。
   * @throws {InfrastructureError} イベントの発行に失敗した場合にスローされます。
   */
  publishEnrolled: (event: ParticipantEnrolled) => Promise<void>;

  /**
   * 参加者休会イベントを発行します。
   *
   * @param event 発行する休会イベントです。
   * @throws {InfrastructureError} イベントの発行に失敗した場合にスローされます。
   */
  publishSuspended: (event: ParticipantSuspended) => Promise<void>;

  /**
   * 参加者復帰イベントを発行します。
   *
   * @param event 発行する復帰イベントです。
   * @throws {InfrastructureError} イベントの発行に失敗した場合にスローされます。
   */
  publishReactivated: (event: ParticipantReactivated) => Promise<void>;

  /**
   * 参加者退会イベントを発行します。
   *
   * @param event 発行する退会イベントです。
   * @throws {InfrastructureError} イベントの発行に失敗した場合にスローされます。
   */
  publishWithdrawn: (event: ParticipantWithdrawn) => Promise<void>;
};
