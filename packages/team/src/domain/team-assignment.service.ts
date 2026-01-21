import type { TeamId, TeamName } from "./team";
import { TeamName as TeamNameFactory } from "./team";

/**
 * チームとそのメンバー数を表す型です。
 */
export type TeamWithMemberCount = {
  /**
   * チームの識別子です。
   */
  teamId: TeamId;

  /**
   * チームのメンバー数です。
   */
  memberCount: number;
};

/**
 * 最小人数のチームを選択します。
 *
 * @param teams チームとそのメンバー数のリストです。
 * @returns 最小人数のチームを返します。同数の場合はランダムに選択します。存在しない場合は undefined を返します。
 * @remarks 最大人数が4名以上のチームは選択対象から除外されます。
 */
export const selectTeamWithMinMembers = (
  teams: TeamWithMemberCount[],
): TeamWithMemberCount | undefined => {
  // 最大人数（4名）以上のチームは除外する
  const eligibleTeams = teams.filter((team) => team.memberCount < 4);

  if (eligibleTeams.length === 0) {
    return undefined;
  }

  // 最小人数を見つける
  const minMemberCount = Math.min(...eligibleTeams.map((team) => team.memberCount));

  // 最小人数のチームをすべて取得
  const teamsWithMinMembers = eligibleTeams.filter((team) => team.memberCount === minMemberCount);

  // ランダムに1つ選択
  const randomIndex = Math.floor(Math.random() * teamsWithMinMembers.length);
  return teamsWithMinMembers[randomIndex];
};

/**
 * チームメンバーを表す型です。
 */
export type TeamMemberInfo = {
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
 * チーム分割の結果を表す型です。
 */
export type TeamSplitResult = {
  /**
   * 元のチームに残るメンバーです。
   */
  originalTeamMembers: TeamMemberInfo[];

  /**
   * 新しいチームに移動するメンバーです。
   */
  newTeamMembers: TeamMemberInfo[];
};

/**
 * チームメンバーを2つに分割します。
 *
 * @param members 分割するメンバーのリストです。
 * @returns 分割結果を返します。
 * @remarks メンバーはシャッフルしてから分割されます。5名の場合は3名と2名に分割されます。
 */
export const splitTeamMembers = (members: TeamMemberInfo[]): TeamSplitResult => {
  // メンバーをシャッフル
  const shuffled = [...members].sort(() => Math.random() - 0.5);

  // 半分に分割（奇数の場合は元のチームに多めに残す）
  const splitIndex = Math.ceil(shuffled.length / 2);
  const originalTeamMembers = shuffled.slice(0, splitIndex);
  const newTeamMembers = shuffled.slice(splitIndex);

  return {
    originalTeamMembers,
    newTeamMembers,
  };
};

/**
 * 使用されていないチーム名の中から次の名前を生成します。
 *
 * @param usedNames 既に使用されているチーム名のリストです。
 * @returns 使用されていない次のチーム名を返します。
 * @throws {Error} 利用可能なチーム名がない場合にスローされます。
 */
export const generateNextTeamName = (usedNames: TeamName[]): TeamName => {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  const usedSet = new Set(usedNames);

  for (const letter of alphabet) {
    const candidateName = TeamNameFactory(letter);
    if (!usedSet.has(candidateName)) {
      return candidateName;
    }
  }

  throw new Error("利用可能なチーム名がありません。");
};
