import type { Participant } from "../../domain";

/**
 * 参加者リポジトリのインターフェースです。
 */
export type ParticipantRepository = {
  /**
   * 参加者を保存します。
   *
   * @param participant 保存する参加者です。
   * @throws {InfrastructureError} 保存に失敗した場合はエラーをスローします。
   */
  save: (participant: Participant) => Promise<void>;

  /**
   * ID から参加者を取得します。
   *
   * @param id 検索する参加者の ID です。
   * @returns 見つかった場合は参加者を、存在しない場合は undefined を返します。
   * @throws {InfrastructureError} 取得に失敗した場合はエラーをスローします。
   */
  findById: (id: Participant["id"]) => Promise<Participant | undefined>;
};
