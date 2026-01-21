import type { Team, TeamId } from "../../domain";

/**
 * チームリポジトリのインターフェースです。
 */
export type TeamRepository = {
  /**
   * チームを保存します。
   *
   * @param team 保存するチームです。
   * @throws {InfrastructureError} 保存に失敗した場合はエラーをスローします。
   */
  save: (team: Team) => Promise<void>;

  /**
   * ID からチームを取得します。
   *
   * @param id 検索するチームの ID です。
   * @returns 見つかった場合はチームを、存在しない場合は undefined を返します。
   * @throws {InfrastructureError} 取得に失敗した場合はエラーをスローします。
   */
  findById: (id: TeamId) => Promise<Team | undefined>;

  /**
   * すべてのチームを取得します。
   *
   * @returns 全チームのリストを返します。
   * @throws {InfrastructureError} 取得に失敗した場合はエラーをスローします。
   */
  findAll: () => Promise<Team[]>;
};
