import { DomainError } from "@ponp/fundamental";

import { Participant, ParticipantId, TeamId } from "../../domain";
import type { EventPublisher } from "../port/event-publisher";
import type { ParticipantRepository } from "../port/participant.repository";

/**
 * 参加者のチーム割り当てユースケースが必要とする依存関係です。
 */
type Dependencies = {
  /**
   * 参加者を保存・取得するリポジトリの関数です。
   * @see ParticipantRepository
   */
  participantRepository: ParticipantRepository;

  /**
   * 参加者イベントを発行するパブリッシャーです。
   * @see EventPublisher
   */
  eventPublisher: EventPublisher;
};

/**
 * 参加者のチーム割り当てに必要なパラメータです。
 */
type AssignTeamParams = {
  /**
   * チームに割り当てる参加者の ID です。
   */
  participantId: string;

  /**
   * 割り当てるチームの ID です。
   */
  teamId: string;
};

/**
 * 参加者のチーム割り当てユースケースの関数の型です。
 */
export type ExecuteAssignTeamUseCase = (params: AssignTeamParams) => Promise<void>;

/**
 * 参加者のチーム割り当てユースケースを作成します。
 *
 * @param dependencies 依存関係を指定します。
 * @returns 参加者のチーム割り当てユースケースを返します。
 */
export const createAssignTeamUseCase = (dependencies: Dependencies): ExecuteAssignTeamUseCase => {
  const { participantRepository, eventPublisher } = dependencies;

  /**
   * 参加者のチーム割り当てを扱うユースケースです。
   *
   * @param params 参加者のチーム割り当てに必要なパラメータです。
   * @throws {ValidationError} 指定されたパラメータのいずれかが不正な場合にスローされます。
   * @throws {DomainError} 参加者が存在しない場合やチーム割り当てできない状態の場合にスローされます。
   * @throws {InfrastructureError} 参加者の取得・保存またはイベント発行に失敗した場合にスローされます。
   */
  const executeAssignTeamUseCase = async (params: AssignTeamParams) => {
    const id = ParticipantId(params.participantId);
    const teamId = TeamId(params.teamId);
    const participant = await participantRepository.findById(id);

    if (!participant) {
      throw new DomainError("指定した参加者が存在しません。", { code: "PARTICIPANT_NOT_FOUND" });
    }

    const [assignedParticipant, participantTeamAssigned] = Participant.assignTeam(
      participant,
      teamId,
    );

    await participantRepository.save(assignedParticipant);
    await eventPublisher.publish(participantTeamAssigned);
  };

  return executeAssignTeamUseCase;
};
