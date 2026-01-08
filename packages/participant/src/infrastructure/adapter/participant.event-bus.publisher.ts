import type { EventBus } from "@ponp/event-bus";
import { publish } from "@ponp/event-bus";
import { InfrastructureError } from "@ponp/fundamental";
import {
  ParticipantEnrolledEvent,
  ParticipantReactivatedEvent,
  ParticipantSuspendedEvent,
  ParticipantWithdrawnEvent,
} from "@ponp/integration-events";

import type { ParticipantEventPublisher } from "../../application/port/event-publisher.port";
import type {
  ParticipantEnrolled,
  ParticipantReactivated,
  ParticipantSuspended,
  ParticipantWithdrawn,
} from "../../domain";

/**
 * イベントバスアダプタの依存関係です。
 */
type ParticipantEventBusPublisherDependencies = {
  /**
   * イベントバスのインスタンスです。
   */
  eventBus: EventBus;
};

/**
 * イベントバスを使用した参加者イベント発行アダプタです。
 *
 * @param dependencies 依存関係を指定します。
 * @returns 参加者イベント発行ポートの実装を返します。
 */
export const ParticipantEventBusPublisher = (
  dependencies: ParticipantEventBusPublisherDependencies,
): ParticipantEventPublisher => {
  const { eventBus } = dependencies;

  return {
    /**
     * 参加者入会イベントを発行します。
     *
     * @param event 発行する入会イベントです。
     * @throws {InfrastructureError} イベントの発行に失敗した場合にスローされます。
     */
    async publishEnrolled(event: ParticipantEnrolled) {
      try {
        const integrationEvent = ParticipantEnrolledEvent({
          participantId: event.participantId,
          name: event.name,
          enrolledAt: event.enrolledAt,
        });
        await publish(eventBus, integrationEvent);
      } catch (error) {
        throw new InfrastructureError("参加者入会イベントの発行に失敗しました。", {
          code: "PARTICIPANT_ENROLLED_EVENT_PUBLISH_FAILED",
          cause: error,
        });
      }
    },

    /**
     * 参加者休会イベントを発行します。
     *
     * @param event 発行する休会イベントです。
     * @throws {InfrastructureError} イベントの発行に失敗した場合にスローされます。
     */
    async publishSuspended(event: ParticipantSuspended) {
      try {
        const integrationEvent = ParticipantSuspendedEvent({
          participantId: event.participantId,
          name: event.name,
          suspendedAt: event.suspendedAt,
        });
        await publish(eventBus, integrationEvent);
      } catch (error) {
        throw new InfrastructureError("参加者休会イベントの発行に失敗しました。", {
          code: "PARTICIPANT_SUSPENDED_EVENT_PUBLISH_FAILED",
          cause: error,
        });
      }
    },

    /**
     * 参加者復帰イベントを発行します。
     *
     * @param event 発行する復帰イベントです。
     * @throws {InfrastructureError} イベントの発行に失敗した場合にスローされます。
     */
    async publishReactivated(event: ParticipantReactivated) {
      try {
        const integrationEvent = ParticipantReactivatedEvent({
          participantId: event.participantId,
          name: event.name,
          reactivatedAt: event.reactivatedAt,
        });
        await publish(eventBus, integrationEvent);
      } catch (error) {
        throw new InfrastructureError("参加者復帰イベントの発行に失敗しました。", {
          code: "PARTICIPANT_REACTIVATED_EVENT_PUBLISH_FAILED",
          cause: error,
        });
      }
    },

    /**
     * 参加者退会イベントを発行します。
     *
     * @param event 発行する退会イベントです。
     * @throws {InfrastructureError} イベントの発行に失敗した場合にスローされます。
     */
    async publishWithdrawn(event: ParticipantWithdrawn) {
      try {
        const integrationEvent = ParticipantWithdrawnEvent({
          participantId: event.participantId,
          name: event.name,
          withdrawnAt: event.withdrawnAt,
        });
        await publish(eventBus, integrationEvent);
      } catch (error) {
        throw new InfrastructureError("参加者退会イベントの発行に失敗しました。", {
          code: "PARTICIPANT_WITHDRAWN_EVENT_PUBLISH_FAILED",
          cause: error,
        });
      }
    },
  };
};
