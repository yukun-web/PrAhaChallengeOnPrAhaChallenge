import type { Database } from "@ponp/fundamental";
import { InfrastructureError } from "@ponp/fundamental";
import { sql } from "drizzle-orm";

import type { TeamMemberCountQuery } from "../../application/port/team-member-count.query";
import { TeamId } from "../../domain";

/**
 * チームメンバー数クエリの依存関係です。
 */
type TeamMemberCountDrizzleQueryDependencies = { db: Database };

/**
 * チームメンバー数クエリの Drizzle ORM を使用した実装です。
 *
 * @param dependencies チームメンバー数クエリの依存関係です。
 * @returns チームメンバー数クエリのインターフェースを実装したオブジェクトを返します。
 * @remarks この実装は participant スキーマの participants テーブルを参照します。
 */
export const TeamMemberCountDrizzleQuery = (
  dependencies: TeamMemberCountDrizzleQueryDependencies,
): TeamMemberCountQuery => {
  const { db } = dependencies;

  return {
    /**
     * 全チームのメンバー数を取得します。
     *
     * @returns 全チームのメンバー数のリストを返します。
     * @throws {InfrastructureError} 取得に失敗した場合はエラーをスローします。
     */
    async getAllTeamMemberCounts() {
      try {
        const NIL_UUID = "00000000-0000-0000-0000-000000000000";
        const result = await db.execute<{ team_id: string; count: string }>(sql`
          SELECT
            data->>'teamId' as team_id,
            COUNT(*) as count
          FROM participant.participants
          WHERE data->>'teamId' != ${NIL_UUID}
            AND data->>'status' = 'ACTIVE'
          GROUP BY data->>'teamId'
        `);

        return result.rows.map((row) => ({
          teamId: TeamId(row.team_id),
          count: Number(row.count),
        }));
      } catch (error) {
        throw new InfrastructureError("チームメンバー数の取得に失敗しました。", {
          code: "TEAM_MEMBER_COUNT_QUERY_FAILED",
          cause: error,
        });
      }
    },

    /**
     * 指定したチームのメンバー数を取得します。
     *
     * @param teamId 取得するチームの識別子です。
     * @returns チームのメンバー数を返します。
     * @throws {InfrastructureError} 取得に失敗した場合はエラーをスローします。
     */
    async getTeamMemberCount(teamId) {
      try {
        const result = await db.execute<{ count: string }>(sql`
          SELECT COUNT(*) as count
          FROM participant.participants
          WHERE data->>'teamId' = ${teamId}
            AND data->>'status' = 'ACTIVE'
        `);

        const row = result.rows[0];
        return row ? Number(row.count) : 0;
      } catch (error) {
        throw new InfrastructureError("チームメンバー数の取得に失敗しました。", {
          code: "TEAM_MEMBER_COUNT_QUERY_FAILED",
          cause: error,
        });
      }
    },

    /**
     * 指定したチームのメンバー一覧を取得します。
     *
     * @param teamId 取得するチームの識別子です。
     * @returns チームメンバーのリストを返します。
     * @throws {InfrastructureError} 取得に失敗した場合はエラーをスローします。
     */
    async getTeamMembers(teamId) {
      try {
        const result = await db.execute<{
          participant_id: string;
          name: string;
        }>(sql`
          SELECT
            data->>'id' as participant_id,
            data->>'name' as name
          FROM participant.participants
          WHERE data->>'teamId' = ${teamId}
            AND data->>'status' = 'ACTIVE'
        `);

        return result.rows.map((row) => ({
          participantId: row.participant_id,
          name: row.name,
        }));
      } catch (error) {
        throw new InfrastructureError("チームメンバーの取得に失敗しました。", {
          code: "TEAM_MEMBERS_QUERY_FAILED",
          cause: error,
        });
      }
    },
  };
};
