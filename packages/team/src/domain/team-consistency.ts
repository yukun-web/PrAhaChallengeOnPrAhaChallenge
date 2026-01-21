import type { TeamId } from "./team";

/**
 * チームメンバー情報です。
 */
export type ParticipantInfo = {
  /**
   * 参加者の識別子です。
   */
  id: string;

  /**
   * 参加者の名前です。
   */
  name: string;
};

/**
 * チームの整合性が保たれている状態です。
 */
export type TeamConsistencyOK = {
  /**
   * 結果タイプです。
   */
  type: "OK";
};

/**
 * チームのメンバー数が最小人数（2名）を下回っている状態です。
 */
export type TeamUnderMinimum = {
  /**
   * 結果タイプです。
   */
  type: "TEAM_UNDER_MINIMUM";

  /**
   * 対象のチームIDです。
   */
  teamId: TeamId;

  /**
   * 現在のメンバー数です。
   */
  memberCount: number;

  /**
   * 残っているメンバーの情報です。
   */
  remainingMembers: ParticipantInfo[];
};

/**
 * チームのメンバーが1名になり、合流が必要な状態です。
 */
export type TeamNeedsMerge = {
  /**
   * 結果タイプです。
   */
  type: "TEAM_NEEDS_MERGE";

  /**
   * 対象のチームIDです。
   */
  teamId: TeamId;

  /**
   * 合流先を探している参加者の情報です。
   */
  soleParticipant: ParticipantInfo;
};

/**
 * 合流先のチームが存在しない状態です。
 */
export type NoMergeTarget = {
  /**
   * 結果タイプです。
   */
  type: "NO_MERGE_TARGET";

  /**
   * 合流先を探している参加者の情報です。
   */
  soleParticipant: ParticipantInfo;
};

/**
 * チームのメンバー数が最大人数（4名）を超えている状態です。
 */
export type TeamOverMaximum = {
  /**
   * 結果タイプです。
   */
  type: "TEAM_OVER_MAXIMUM";

  /**
   * 対象のチームIDです。
   */
  teamId: TeamId;

  /**
   * 現在のメンバー数です。
   */
  memberCount: number;
};

/**
 * チームの整合性チェックの結果を表す型です。
 */
export type TeamConsistencyCheckResult =
  | TeamConsistencyOK
  | TeamUnderMinimum
  | TeamNeedsMerge
  | NoMergeTarget
  | TeamOverMaximum;

/**
 * チームの整合性が保たれているかどうかを判定します。
 *
 * @param result チームの整合性チェックの結果です。
 * @returns 整合性が保たれている場合は true を、そうでない場合は false を返します。
 */
export const isTeamConsistencyOK = (
  result: TeamConsistencyCheckResult,
): result is TeamConsistencyOK => {
  return result.type === "OK";
};
