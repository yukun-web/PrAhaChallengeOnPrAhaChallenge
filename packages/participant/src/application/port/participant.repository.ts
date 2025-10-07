import type { Participant } from "../../domain";

/**
 * 参加者を保存します。
 *
 * @param participant 保存する参加者を指定します。
 * @throws {InfrastructureError} 保存に失敗した場合はエラーをスローします。
 */
export type SaveParticipant = (participant: Participant) => Promise<void>;
