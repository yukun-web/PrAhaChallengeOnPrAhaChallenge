import type { EventBus } from "@ponp/event-bus";
import { publish } from "@ponp/event-bus";
import { InfrastructureError } from "@ponp/fundamental";
import {
  ParticipantEnrolledEvent,
  ParticipantReactivatedEvent,
  ParticipantSuspendedEvent,
  ParticipantTeamAssignedEvent,
  ParticipantWithdrawnEvent,
} from "@ponp/integration-events";

import type { EventPublisher } from "../../application/port/event-publisher";
import type {
  ParticipantEnrolled,
  ParticipantEvent,
  ParticipantReactivated,
  ParticipantSuspended,
  ParticipantTeamAssigned,
  ParticipantWithdrawn,
} from "../../domain";
import { ParticipantEventType } from "../../domain";

/**
 * 統合イベントの型です。
 */
type IntegrationEvent =
  | ParticipantEnrolledEvent
  | ParticipantSuspendedEvent
  | ParticipantReactivatedEvent
  | ParticipantWithdrawnEvent
  | ParticipantTeamAssignedEvent;

/**
 * ドメインイベントを統合イベントに変換する関数のマップです。
 */
const converters: {
  [K in ParticipantEvent["type"]]: (
    event: Extract<ParticipantEvent, { type: K }>,
  ) => IntegrationEvent;
} = {
  [ParticipantEventType.ENROLLED]: (event: ParticipantEnrolled) =>
    ParticipantEnrolledEvent({
      participantId: event.participantId,
      name: event.name,
      enrolledAt: event.enrolledAt,
    }),
  [ParticipantEventType.SUSPENDED]: (event: ParticipantSuspended) =>
    ParticipantSuspendedEvent({
      participantId: event.participantId,
      name: event.name,
      previousTeamId: event.previousTeamId,
      suspendedAt: event.suspendedAt,
    }),
  [ParticipantEventType.REACTIVATED]: (event: ParticipantReactivated) =>
    ParticipantReactivatedEvent({
      participantId: event.participantId,
      name: event.name,
      reactivatedAt: event.reactivatedAt,
    }),
  [ParticipantEventType.WITHDRAWN]: (event: ParticipantWithdrawn) =>
    ParticipantWithdrawnEvent({
      participantId: event.participantId,
      name: event.name,
      previousTeamId: event.previousTeamId,
      withdrawnAt: event.withdrawnAt,
    }),
  [ParticipantEventType.TEAM_ASSIGNED]: (event: ParticipantTeamAssigned) =>
    ParticipantTeamAssignedEvent({
      participantId: event.participantId,
      name: event.name,
      teamId: event.teamId,
      assignedAt: event.assignedAt,
    }),
};

/**
 * イベントバスアダプタの依存関係です。
 */
type PonpEventBusEventPublisherDependencies = {
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
export const PonpEventBusEventPublisher = (
  dependencies: PonpEventBusEventPublisherDependencies,
): EventPublisher => {
  const { eventBus } = dependencies;

  return {
    /**
     * 参加者イベントを発行します。
     *
     * @param event 発行するイベントです。
     * @throws {InfrastructureError} イベントの発行に失敗した場合にスローされます。
     */
    async publish(event: ParticipantEvent) {
      try {
        const converter = converters[event.type];
        const integrationEvent = converter(event as never);
        await publish<IntegrationEvent>(eventBus, integrationEvent);
      } catch (error) {
        throw new InfrastructureError(`${event.type} イベントの発行に失敗しました。`, {
          code: `${event.type}_EVENT_PUBLISH_FAILED`,
          cause: error,
        });
      }
    },
  };
};
