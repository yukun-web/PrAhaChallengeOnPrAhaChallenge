import type { TeamId } from "../../domain";

/**
 * チームとそのメンバー数を表す型です。
 */
export type TeamMemberCount = {
  /**
   * チームの識別子です。
   */
  teamId: TeamId;

  /**
   * チームのメンバー数です。
   */
  count: number;
};

/**
 * チームメンバーの情報を表す型です。
 */
export type TeamMember = {
  /**
   * 参加者の識別子です。
   */
  participantId: string;

  /**
   * 参加者の名前です。
   */
  name: string;
};

/**
 * チームメンバー数を取得するためのクエリのインターフェースです。
 */
export type TeamMemberCountQuery = {
  /**
   * 全チームのメンバー数を取得します。
   *
   * @returns 全チームのメンバー数のリストを返します。
   * @throws {InfrastructureError} 取得に失敗した場合はエラーをスローします。
   */
  getAllTeamMemberCounts: () => Promise<TeamMemberCount[]>;

  /**
   * 指定したチームのメンバー数を取得します。
   *
   * @param teamId 取得するチームの識別子です。
   * @returns チームのメンバー数を返します。
   * @throws {InfrastructureError} 取得に失敗した場合はエラーをスローします。
   */
  getTeamMemberCount: (teamId: TeamId) => Promise<number>;

  /**
   * 指定したチームのメンバー一覧を取得します。
   *
   * @param teamId 取得するチームの識別子です。
   * @returns チームメンバーのリストを返します。
   * @throws {InfrastructureError} 取得に失敗した場合はエラーをスローします。
   */
  getTeamMembers: (teamId: TeamId) => Promise<TeamMember[]>;
};
