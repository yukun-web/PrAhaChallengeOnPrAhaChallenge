import { DomainError } from "@ponp/fundamental";

import { Participant, ParticipantId } from "../../domain";
import type { EventPublisher } from "../port/event-publisher";
import type { ParticipantRepository } from "../port/participant.repository";

/**
 * 参加者の退会ユースケースが必要とする依存関係です。
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
 * 参加者の退会に必要なパラメータです。
 */
type WithdrawParams = {
  /**
   * 退会させる参加者の ID です。
   */
  participantId: string;
};

/**
 * 参加者の退会ユースケースの関数の型です。
 */
export type ExecuteWithdrawUseCase = (params: WithdrawParams) => Promise<void>;

/**
 * 参加者の退会ユースケースを作成します。
 *
 * @param dependencies 依存関係を指定します。
 * @returns 参加者の退会ユースケースを返します。
 */
export const createWithdrawUseCase = (dependencies: Dependencies): ExecuteWithdrawUseCase => {
  const { participantRepository, eventPublisher } = dependencies;

  /**
   * 参加者の退会を扱うユースケースです。
   *
   * @param params 参加者の退会に必要なパラメータです。
   * @throws {ValidationError} 指定されたパラメータのいずれかが不正な場合にスローされます。
   * @throws {DomainError} 参加者が存在しない場合や退会できない状態の場合にスローされます。
   * @throws {InfrastructureError} 参加者の取得・保存またはイベント発行に失敗した場合にスローされます。
   */
  const executeWithdrawUseCase = async (params: WithdrawParams) => {
    const { participantId } = params;

    const id = ParticipantId(participantId);
    const participant = await participantRepository.findById(id);

    if (!participant) {
      throw new DomainError("指定した参加者が存在しません。", { code: "PARTICIPANT_NOT_FOUND" });
    }

    const [withdrawnParticipant, participantWithdrawn] = Participant.withdraw(participant);

    await participantRepository.save(withdrawnParticipant);
    await eventPublisher.publishWithdrawn(participantWithdrawn);
  };

  return executeWithdrawUseCase;
};
