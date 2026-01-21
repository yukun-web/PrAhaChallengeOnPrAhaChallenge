import { DomainError } from "@ponp/fundamental";

import type { TeamName } from "../../domain";
import type { TeamRepository } from "../port/team.repository";

/**
 * チーム名の重複をチェックするドメインサービスを作成します。
 *
 * @param teamRepository チームリポジトリです。
 * @returns チーム名の重複をチェックする関数を返します。
 */
export const createEnsureTeamNameNotDuplicated = (teamRepository: TeamRepository) => {
  /**
   * チーム名が重複していないことを確認します。
   *
   * @param name 確認するチーム名です。
   * @throws {DomainError} チーム名が既に登録されている場合にスローされます。
   * @throws {InfrastructureError} チームの取得に失敗した場合にスローされます。
   */
  return async (name: TeamName): Promise<void> => {
    const existingTeam = await teamRepository.findByName(name);
    if (existingTeam) {
      throw new DomainError("指定されたチーム名は既に登録されています。", {
        code: "TEAM_NAME_ALREADY_EXISTS",
      });
    }
  };
};

/**
 * チーム名の重複をチェックするドメインサービスの型です。
 */
export type EnsureTeamNameNotDuplicated = ReturnType<typeof createEnsureTeamNameNotDuplicated>;
