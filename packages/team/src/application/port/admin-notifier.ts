import type { TeamId } from "../../domain";

/**
 * チーム人数不足の通知に必要なパラメータです。
 */
export type NotifyTeamUnderMinimumParams = {
  /**
   * 減少した参加者の名前です。
   */
  leavingParticipantName: string;

  /**
   * 人数不足になったチームの識別子です。
   */
  teamId: TeamId;

  /**
   * 現在のメンバー数です。
   */
  currentMemberCount: number;

  /**
   * 残っている参加者名のリストです。
   */
  remainingParticipantNames: string[];
};

/**
 * 合流先がない通知に必要なパラメータです。
 */
export type NotifyNoMergeTargetParams = {
  /**
   * 減少した参加者の名前です。
   */
  leavingParticipantName: string;

  /**
   * 合流先を探している参加者の名前です。
   */
  soleParticipantName: string;
};

/**
 * 管理者への通知を行うポートのインターフェースです。
 */
export type AdminNotifier = {
  /**
   * チーム人数が最小人数を下回った際に管理者に通知します。
   *
   * @param params 通知に必要なパラメータです。
   * @throws {InfrastructureError} 通知に失敗した場合にスローされます。
   */
  notifyTeamUnderMinimum: (params: NotifyTeamUnderMinimumParams) => Promise<void>;

  /**
   * 合流先がない場合に管理者に通知します。
   *
   * @param params 通知に必要なパラメータです。
   * @throws {InfrastructureError} 通知に失敗した場合にスローされます。
   */
  notifyNoMergeTarget: (params: NotifyNoMergeTargetParams) => Promise<void>;
};
