import { Participant, ParticipantEmail, ParticipantName } from "../../domain";
import type { EventPublisher } from "../port/event-publisher";
import type { ParticipantRepository } from "../port/participant.repository";

/**
 * 参加者の入会ユースケースが必要とする依存関係です。
 */
type Dependencies = {
  /**
   * 参加者を保存するリポジトリの関数です。
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
 * 参加者の入会に必要なパラメータです。
 */
type EnrollParams = {
  /**
   * 入会する参加者の名前です。
   */
  name: string;

  /**
   * 入会する参加者のメールアドレスです。
   */
  email: string;
};

/**
 * 参加者の入会ユースケースの関数の型です。
 */
export type ExecuteEnrollUseCase = (params: EnrollParams) => Promise<void>;

/**
 * 参加者の入会ユースケースを作成します。
 *
 * @param dependencies 依存関係を指定します。
 * @returns 参加者の入会ユースケースを返します。
 */
export const createEnrollUseCase = (dependencies: Dependencies): ExecuteEnrollUseCase => {
  const { participantRepository, eventPublisher } = dependencies;

  /**
   * 参加者の入会を扱うユースケースです。
   *
   * @param params 参加者の入会に必要なパラメータです。
   * @throws {ValidationError} 指定されたパラメータのいずれかが不正な場合にスローされます。
   * @throws {InfrastructureError} 参加者の保存またはイベント発行に失敗した場合にスローされます。
   */
  const executeEnrollUseCase = async (params: EnrollParams) => {
    const { name, email } = params;

    const [enrolledParticipant, participantEnrolled] = Participant.enroll({
      name: ParticipantName(name),
      email: ParticipantEmail(email),
    });

    await participantRepository.save(enrolledParticipant);
    await eventPublisher.publishEnrolled(participantEnrolled);
  };

  return executeEnrollUseCase;
};
