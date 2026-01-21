import {
  selectTeamWithMinMembers,
  type TeamConsistencyCheckResult,
  TeamId,
} from "../../domain";
import type { AdminNotifier } from "../port/admin-notifier";
import type { ParticipantAssignment } from "../port/participant-assignment";
import type { TeamMemberCountQuery } from "../port/team-member-count.query";

/**
 * メンバー離脱処理ユースケースが必要とする依存関係です。
 */
type Dependencies = {
  /**
   * チームメンバー数を取得するクエリです。
   */
  teamMemberCountQuery: TeamMemberCountQuery;

  /**
   * 管理者への通知を行うポートです。
   */
  adminNotifier: AdminNotifier;

  /**
   * 参加者のチーム割り当てを行うポートです。
   */
  participantAssignment: ParticipantAssignment;
};

/**
 * メンバー離脱処理に必要なパラメータです。
 */
type HandleMemberLeaveParams = {
  /**
   * 離脱した参加者の名前です。
   */
  leavingParticipantName: string;

  /**
   * 離脱した参加者が所属していたチームの識別子です。
   */
  teamId: string;
};

/**
 * メンバー離脱処理ユースケースの結果です。
 */
export type HandleMemberLeaveResult = TeamConsistencyCheckResult;

/**
 * メンバー離脱処理ユースケースの関数の型です。
 */
export type ExecuteHandleMemberLeaveUseCase = (
  params: HandleMemberLeaveParams,
) => Promise<HandleMemberLeaveResult>;

/**
 * メンバー離脱処理ユースケースを作成します。
 *
 * @param dependencies 依存関係を指定します。
 * @returns メンバー離脱処理ユースケースを返します。
 */
export const createHandleMemberLeaveUseCase = (
  dependencies: Dependencies,
): ExecuteHandleMemberLeaveUseCase => {
  const { teamMemberCountQuery, adminNotifier, participantAssignment } = dependencies;

  /**
   * メンバー離脱後のチーム整合性をチェックし、必要な処理を行います。
   *
   * @param params メンバー離脱処理に必要なパラメータです。
   * @returns チームの整合性チェック結果を返します。
   * @throws {ValidationError} パラメータが不正な場合にスローされます。
   * @throws {InfrastructureError} 処理に失敗した場合にスローされます。
   */
  const executeHandleMemberLeaveUseCase = async (
    params: HandleMemberLeaveParams,
  ): Promise<HandleMemberLeaveResult> => {
    const teamId = TeamId(params.teamId);

    // 離脱後のチームのメンバー数を取得
    const memberCount = await teamMemberCountQuery.getTeamMemberCount(teamId);

    // 2名以上の場合は正常
    if (memberCount >= 2) {
      return { type: "OK" };
    }

    // 残っているメンバーを取得
    const remainingMembers = await teamMemberCountQuery.getTeamMembers(teamId);

    // 2名以下だが1名より多い場合（つまり2名の場合のメンバー減少）は管理者に通知
    if (memberCount === 2) {
      await adminNotifier.notifyTeamUnderMinimum({
        leavingParticipantName: params.leavingParticipantName,
        teamId,
        currentMemberCount: memberCount,
        remainingParticipantNames: remainingMembers.map((m) => m.name),
      });

      return {
        type: "TEAM_UNDER_MINIMUM",
        teamId,
        memberCount,
        remainingMembers: remainingMembers.map((m) => ({
          id: m.participantId,
          name: m.name,
        })),
      };
    }

    // 1名の場合は自動合流処理
    if (memberCount === 1) {
      const soleParticipant = remainingMembers[0];
      if (!soleParticipant) {
        return { type: "OK" }; // メンバーが既にいない場合
      }

      // 合流先を探す
      const allTeamCounts = await teamMemberCountQuery.getAllTeamMemberCounts();

      // 現在のチームを除外した上で最小人数のチームを選択
      const otherTeams = allTeamCounts.filter((t) => t.teamId !== teamId);
      const targetTeam = selectTeamWithMinMembers(
        otherTeams.map((t) => ({ teamId: t.teamId, memberCount: t.count })),
      );

      if (!targetTeam) {
        // 合流先がない場合は管理者に通知
        await adminNotifier.notifyNoMergeTarget({
          leavingParticipantName: params.leavingParticipantName,
          soleParticipantName: soleParticipant.name,
        });

        return {
          type: "NO_MERGE_TARGET",
          soleParticipant: {
            id: soleParticipant.participantId,
            name: soleParticipant.name,
          },
        };
      }

      // 合流処理を実行
      await participantAssignment.assignToTeam({
        participantId: soleParticipant.participantId,
        teamId: targetTeam.teamId,
      });

      return {
        type: "TEAM_NEEDS_MERGE",
        teamId,
        soleParticipant: {
          id: soleParticipant.participantId,
          name: soleParticipant.name,
        },
      };
    }

    // 0名の場合（チームが空になった）
    return { type: "OK" };
  };

  return executeHandleMemberLeaveUseCase;
};
