import { DomainError } from "@ponp/fundamental";

import {
  generateNextTeamName,
  splitTeamMembers,
  Team,
  TeamId,
  type TeamName,
} from "../../domain";
import type { ParticipantAssignment } from "../port/participant-assignment";
import type { TeamMemberCountQuery } from "../port/team-member-count.query";
import type { TeamRepository } from "../port/team.repository";

/**
 * チーム分割ユースケースが必要とする依存関係です。
 */
type Dependencies = {
  /**
   * チームリポジトリです。
   */
  teamRepository: TeamRepository;

  /**
   * チームメンバー数を取得するクエリです。
   */
  teamMemberCountQuery: TeamMemberCountQuery;

  /**
   * 参加者のチーム割り当てを行うポートです。
   */
  participantAssignment: ParticipantAssignment;
};

/**
 * チーム分割に必要なパラメータです。
 */
type SplitTeamParams = {
  /**
   * 分割するチームの識別子です。
   */
  teamId: string;
};

/**
 * チーム分割ユースケースの関数の型です。
 */
export type ExecuteSplitTeamUseCase = (params: SplitTeamParams) => Promise<void>;

/**
 * チーム分割ユースケースを作成します。
 *
 * @param dependencies 依存関係を指定します。
 * @returns チーム分割ユースケースを返します。
 */
export const createSplitTeamUseCase = (dependencies: Dependencies): ExecuteSplitTeamUseCase => {
  const { teamRepository, teamMemberCountQuery, participantAssignment } = dependencies;

  /**
   * チームを2つに分割します。
   *
   * @param params チーム分割に必要なパラメータです。
   * @throws {DomainError} チームが存在しない場合にスローされます。
   * @throws {InfrastructureError} 処理に失敗した場合にスローされます。
   */
  const executeSplitTeamUseCase = async (params: SplitTeamParams): Promise<void> => {
    const teamId = TeamId(params.teamId);

    // 分割対象のチームメンバーを取得
    const members = await teamMemberCountQuery.getTeamMembers(teamId);

    if (members.length < 5) {
      throw new DomainError("チームのメンバー数が5名未満のため分割できません。", {
        code: "TEAM_MEMBER_COUNT_TOO_LOW_TO_SPLIT",
      });
    }

    // メンバーを2つに分割
    const splitResult = splitTeamMembers(
      members.map((m) => ({
        participantId: m.participantId,
        name: m.name,
      })),
    );

    // 既存のチーム名を取得
    const allTeams = await teamRepository.findAll();
    const usedNames = allTeams.map((t) => t.name) as TeamName[];

    // 新しいチーム名を生成
    const newTeamName = generateNextTeamName(usedNames);

    // 新しいチームを作成
    const [newTeam] = Team.create({ name: newTeamName });
    await teamRepository.save(newTeam);

    // 新しいチームに移動するメンバーを割り当て
    for (const member of splitResult.newTeamMembers) {
      await participantAssignment.assignToTeam({
        participantId: member.participantId,
        teamId: newTeam.id,
      });
    }
  };

  return executeSplitTeamUseCase;
};
