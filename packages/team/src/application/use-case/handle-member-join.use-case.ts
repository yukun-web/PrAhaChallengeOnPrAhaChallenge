import { DomainError } from "@ponp/fundamental";

import { selectTeamWithMinMembers, type TeamId } from "../../domain";
import type { ParticipantAssignment } from "../port/participant-assignment";
import type { TeamMemberCountQuery } from "../port/team-member-count.query";

/**
 * メンバー参加処理ユースケースが必要とする依存関係です。
 */
type Dependencies = {
  /**
   * チームメンバー数を取得するクエリです。
   */
  teamMemberCountQuery: TeamMemberCountQuery;

  /**
   * 参加者のチーム割り当てを行うポートです。
   */
  participantAssignment: ParticipantAssignment;

  /**
   * チーム分割を行う関数です。
   */
  splitTeam: ExecuteSplitTeamUseCase;
};

/**
 * チーム分割ユースケースの関数の型です（循環参照回避用）。
 */
type ExecuteSplitTeamUseCase = (params: { teamId: string }) => Promise<void>;

/**
 * メンバー参加処理に必要なパラメータです。
 */
type HandleMemberJoinParams = {
  /**
   * 復帰した参加者の識別子です。
   */
  participantId: string;
};

/**
 * メンバー参加処理ユースケースの結果です。
 */
export type HandleMemberJoinResult = {
  /**
   * 割り当てられたチームの識別子です。
   */
  assignedTeamId: TeamId;

  /**
   * チームが分割されたかどうかです。
   */
  teamWasSplit: boolean;
};

/**
 * メンバー参加処理ユースケースの関数の型です。
 */
export type ExecuteHandleMemberJoinUseCase = (
  params: HandleMemberJoinParams,
) => Promise<HandleMemberJoinResult>;

/**
 * メンバー参加処理ユースケースを作成します。
 *
 * @param dependencies 依存関係を指定します。
 * @returns メンバー参加処理ユースケースを返します。
 */
export const createHandleMemberJoinUseCase = (
  dependencies: Dependencies,
): ExecuteHandleMemberJoinUseCase => {
  const { teamMemberCountQuery, participantAssignment, splitTeam } = dependencies;

  /**
   * 復帰した参加者を最小人数のチームに割り当て、必要に応じてチームを分割します。
   *
   * @param params メンバー参加処理に必要なパラメータです。
   * @returns 割り当て結果を返します。
   * @throws {DomainError} 割り当て可能なチームが存在しない場合にスローされます。
   * @throws {InfrastructureError} 処理に失敗した場合にスローされます。
   */
  const executeHandleMemberJoinUseCase = async (
    params: HandleMemberJoinParams,
  ): Promise<HandleMemberJoinResult> => {
    // 全チームのメンバー数を取得
    const allTeamCounts = await teamMemberCountQuery.getAllTeamMemberCounts();

    // 最小人数のチームを選択
    const targetTeam = selectTeamWithMinMembers(
      allTeamCounts.map((t) => ({ teamId: t.teamId, memberCount: t.count })),
    );

    if (!targetTeam) {
      throw new DomainError("割り当て可能なチームが存在しません。", {
        code: "NO_AVAILABLE_TEAM",
      });
    }

    // 参加者をチームに割り当て
    await participantAssignment.assignToTeam({
      participantId: params.participantId,
      teamId: targetTeam.teamId,
    });

    // 割り当て後のメンバー数を計算（+1）
    const newMemberCount = targetTeam.memberCount + 1;

    // 5名以上になった場合はチームを分割
    if (newMemberCount >= 5) {
      await splitTeam({ teamId: targetTeam.teamId });
      return {
        assignedTeamId: targetTeam.teamId,
        teamWasSplit: true,
      };
    }

    return {
      assignedTeamId: targetTeam.teamId,
      teamWasSplit: false,
    };
  };

  return executeHandleMemberJoinUseCase;
};
