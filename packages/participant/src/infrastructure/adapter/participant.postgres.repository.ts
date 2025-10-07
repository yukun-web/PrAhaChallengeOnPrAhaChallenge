import type { Database } from "@ponp/fundamental";
import { InfrastructureError } from "@ponp/fundamental";
import { upsertAggregateTable } from "@ponp/fundamental";

import type { Participant } from "../../domain";
import { participantsTable } from "../db/schema";

/**
 * 参加者リポジトリの操作関数の依存関係です。
 */
type Dependencies = { db: Database };

/**
 * 参加者を保存する関数を作成します。
 *
 * @param dependencies 参加者リポジトリの操作関数の依存関係です。
 * @returns 参加者を保存する関数を返します。
 */
export const createSaveParticipant = (dependencies: Dependencies) => {
  const { db } = dependencies;

  /**
   * 参加者を保存します。
   *
   * @param participant 保存する参加者を指定します。
   */
  const saveParticipant = async (participant: Participant) => {
    try {
      await upsertAggregateTable(db, participantsTable, participant);
    } catch (error) {
      throw new InfrastructureError("参加者の保存に失敗しました。", {
        code: "PARTICIPANT_SAVE_FAILED",
        cause: error,
      });
    }
  };

  return saveParticipant;
};
