import { DomainError } from "@ponp/fundamental";

import { Participant, ParticipantId } from "../../domain";
import type { ParticipantRepository } from "../port/participant.repository";

/**
 * 参加者の復帰ユースケースが必要とする依存関係です。
 */
type Dependencies = {
  /**
   * 参加者を保存・取得するリポジトリの関数です。
   * @see ParticipantRepository
   */
  participantRepository: ParticipantRepository;
};

/**
 * 参加者の復帰に必要なパラメータです。
 */
type ReactivateParams = {
  /**
   * 復帰させる参加者の ID です。
   */
  participantId: string;
};

/**
 * 参加者の復帰ユースケースの関数の型です。
 */
export type ExecuteReactivateUseCase = (params: ReactivateParams) => Promise<void>;

/**
 * 参加者の復帰ユースケースを作成します。
 *
 * @param dependencies 依存関係を指定します。
 * @returns 参加者の復帰ユースケースを返します。
 */
export const createReactivateUseCase = (
  dependencies: Dependencies,
): ExecuteReactivateUseCase => {
  const { participantRepository } = dependencies;

  /**
   * 参加者の復帰を扱うユースケースです。
   *
   * @param params 参加者の復帰に必要なパラメータです。
   * @throws {ValidationError} 指定されたパラメータのいずれかが不正な場合にスローされます。
   * @throws {DomainError} 参加者が存在しない場合や復帰できない状態の場合にスローされます。
   * @throws {InfrastructureError} 参加者の取得・保存に失敗した場合にスローされます。
   */
  const executeReactivateUseCase = async (params: ReactivateParams) => {
    const { participantId } = params;

    const id = ParticipantId(participantId);
    const participant = await participantRepository.findById(id);

    if (!participant) {
      throw new DomainError("指定した参加者が存在しません。", { code: "PARTICIPANT_NOT_FOUND" });
    }

    const [reactivatedParticipant, participantReactivated] = Participant.reactivate(participant);

    console.log("event published", participantReactivated); // TODO: イベントバスに乗せる
    await participantRepository.save(reactivatedParticipant);
  };

  return executeReactivateUseCase;
};
