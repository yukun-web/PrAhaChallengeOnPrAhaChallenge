import type { HandlerRegistry } from "@ponp/event-bus";
import { registerHandler } from "@ponp/event-bus";
import {
  type ParticipantReactivatedEvent,
  ParticipantReactivatedEvent as ParticipantReactivatedEventConstructor,
  type ParticipantSuspendedEvent,
  ParticipantSuspendedEvent as ParticipantSuspendedEventConstructor,
  type ParticipantWithdrawnEvent,
  ParticipantWithdrawnEvent as ParticipantWithdrawnEventConstructor,
} from "@ponp/integration-events";
import type { ExecuteHandleMemberJoinUseCase } from "@ponp/team";
import type { ExecuteHandleMemberLeaveUseCase } from "@ponp/team";

/**
 * チームメンバーシップイベントハンドラの依存関係です。
 */
type Dependencies = {
  /**
   * メンバー離脱処理ユースケースです。
   */
  handleMemberLeave: ExecuteHandleMemberLeaveUseCase;

  /**
   * メンバー参加処理ユースケースです。
   */
  handleMemberJoin: ExecuteHandleMemberJoinUseCase;
};

/**
 * チームメンバーシップのイベントハンドラを登録します。
 *
 * @param registry ハンドラレジストリです。
 * @param dependencies 依存関係です。
 */
export const registerTeamMembershipHandlers = (
  registry: HandlerRegistry,
  dependencies: Dependencies,
): void => {
  const { handleMemberLeave, handleMemberJoin } = dependencies;

  /**
   * 参加者休会イベントのハンドラです。
   * 参加者が休会した際にチームの整合性をチェックし、必要に応じて再編成を行います。
   */
  registerHandler(
    registry,
    ParticipantSuspendedEventConstructor,
    "team-membership-on-suspended",
    async (event: ParticipantSuspendedEvent) => {
      await handleMemberLeave({
        leavingParticipantName: event.payload.name,
        teamId: event.payload.previousTeamId,
      });
    },
  );

  /**
   * 参加者退会イベントのハンドラです。
   * 参加者が退会した際にチームの整合性をチェックし、必要に応じて再編成を行います。
   */
  registerHandler(
    registry,
    ParticipantWithdrawnEventConstructor,
    "team-membership-on-withdrawn",
    async (event: ParticipantWithdrawnEvent) => {
      await handleMemberLeave({
        leavingParticipantName: event.payload.name,
        teamId: event.payload.previousTeamId,
      });
    },
  );

  /**
   * 参加者復帰イベントのハンドラです。
   * 参加者が復帰した際に最小人数のチームに割り当て、必要に応じてチームを分割します。
   */
  registerHandler(
    registry,
    ParticipantReactivatedEventConstructor,
    "team-membership-on-reactivated",
    async (event: ParticipantReactivatedEvent) => {
      await handleMemberJoin({
        participantId: event.payload.participantId,
      });
    },
  );
};
