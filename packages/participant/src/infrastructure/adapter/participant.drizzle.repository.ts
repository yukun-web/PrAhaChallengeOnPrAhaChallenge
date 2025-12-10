import type { Database } from "@ponp/fundamental";
import { InfrastructureError, upsertAggregateTable } from "@ponp/fundamental";
import { eq } from "drizzle-orm";

import type { ParticipantRepository } from "../../application/port/participant.repository";
import type { ParticipantId } from "../../domain";
import { Participant } from "../../domain";
import { participantsTable } from "../db/schema";

/**
 * 参加者リポジトリの操作関数の依存関係です。
 */
type ParticipantDrizzleRepositoryDependencies = { db: Database };

/**
 * 参加者リポジトリの Drizzle ORM を使用した実装です。
 *
 * @param dependencies 参加者リポジトリの操作関数の依存関係です。
 * @returns 参加者リポジトリのインターフェースを実装したオブジェクトを返します。
 */
export const ParticipantDrizzleRepository = (
  dependencies: ParticipantDrizzleRepositoryDependencies,
): ParticipantRepository => {
  const { db } = dependencies;

  return {
    /**
     * 参加者を保存します。
     *
     * @param participant 保存する参加者です。
     * @throws {InfrastructureError} 保存に失敗した場合はエラーをスローします。
     */
    async save(participant: Participant) {
      try {
        await upsertAggregateTable(db, participantsTable, participant);
      } catch (error) {
        throw new InfrastructureError("参加者の保存に失敗しました。", {
          code: "PARTICIPANT_SAVE_FAILED",
          cause: error,
        });
      }
    },

    /**
     * ID から参加者を取得します。
     *
     * @param id 検索する参加者の ID です。
     * @returns 見つかった場合は参加者を、存在しない場合は undefined を返します。
     * @throws {InfrastructureError} 取得に失敗した場合はエラーをスローします。
     */
    async findById(id: ParticipantId) {
      try {
        const [record] = await db
          .select({ data: participantsTable.data })
          .from(participantsTable)
          .where(eq(participantsTable.id, id))
          .limit(1)
          .execute();

        if (record === undefined) {
          return undefined;
        }

        // reconstruct の中で各値のバリエーションが当たるので as を許容しています。 TODO: 本当にそれでいいのか検討
        return Participant.reconstruct(record.data as Participant);
      } catch (error) {
        throw new InfrastructureError("参加者の取得に失敗しました。", {
          code: "PARTICIPANT_FIND_BY_ID_FAILED",
          cause: error,
        });
      }
    },
  };
};
