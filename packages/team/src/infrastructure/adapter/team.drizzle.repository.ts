import type { Database } from "@ponp/fundamental";
import {
  findAggregateTableById,
  InfrastructureError,
  upsertAggregateTable,
} from "@ponp/fundamental";

import type { TeamRepository } from "../../application/port/team.repository";
import type { Team, TeamId } from "../../domain";
import { Team as TeamEntity } from "../../domain";
import { teamsTable } from "../db/schema";

/**
 * チームリポジトリの操作関数の依存関係です。
 */
type TeamDrizzleRepositoryDependencies = { db: Database };

/**
 * チームリポジトリの Drizzle ORM を使用した実装です。
 *
 * @param dependencies チームリポジトリの操作関数の依存関係です。
 * @returns チームリポジトリのインターフェースを実装したオブジェクトを返します。
 */
export const TeamDrizzleRepository = (
  dependencies: TeamDrizzleRepositoryDependencies,
): TeamRepository => {
  const { db } = dependencies;

  return {
    /**
     * チームを保存します。
     *
     * @param team 保存するチームです。
     * @throws {InfrastructureError} 保存に失敗した場合はエラーをスローします。
     */
    async save(team: Team) {
      try {
        await upsertAggregateTable(db, teamsTable, team);
      } catch (error) {
        throw new InfrastructureError("チームの保存に失敗しました。", {
          code: "TEAM_SAVE_FAILED",
          cause: error,
        });
      }
    },

    /**
     * ID からチームを取得します。
     *
     * @param id 検索するチームの ID です。
     * @returns 見つかった場合はチームを、存在しない場合は undefined を返します。
     * @throws {InfrastructureError} 取得に失敗した場合はエラーをスローします。
     */
    async findById(id: TeamId) {
      try {
        const record = await findAggregateTableById<Team>(db, teamsTable, id);
        return record && TeamEntity.reconstruct(record);
      } catch (error) {
        throw new InfrastructureError("チームの取得に失敗しました。", {
          code: "TEAM_FIND_BY_ID_FAILED",
          cause: error,
        });
      }
    },

    /**
     * すべてのチームを取得します。
     *
     * @returns 全チームのリストを返します。
     * @throws {InfrastructureError} 取得に失敗した場合はエラーをスローします。
     */
    async findAll() {
      try {
        const records = await db
          .select({ data: teamsTable.data })
          .from(teamsTable)
          .execute();

        return records
          .filter((record): record is { data: Team } => record.data !== null)
          .map((record) => TeamEntity.reconstruct(record.data));
      } catch (error) {
        throw new InfrastructureError("チームの取得に失敗しました。", {
          code: "TEAM_FIND_ALL_FAILED",
          cause: error,
        });
      }
    },
  };
};
