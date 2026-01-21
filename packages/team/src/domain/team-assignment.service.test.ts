import { describe, expect, test } from "vitest";

import { TeamId, TeamName } from "./team";
import {
  generateNextTeamName,
  selectTeamWithMinMembers,
  splitTeamMembers,
  type TeamMemberInfo,
  type TeamWithMemberCount,
} from "./team-assignment.service";

describe("selectTeamWithMinMembers", () => {
  /**
   * テスト用のチームID1です。
   */
  const TEST_TEAM_ID_1 = TeamId("a1b2c3d4-e5f6-4a7b-ac9d-0e1f2a3b4c5d");

  /**
   * テスト用のチームID2です。
   */
  const TEST_TEAM_ID_2 = TeamId("b2c3d4e5-f6a7-4b8c-ad0e-1f2a3b4c5d6e");

  /**
   * テスト用のチームID3です。
   */
  const TEST_TEAM_ID_3 = TeamId("c3d4e5f6-a7b8-4c9d-ae1f-2a3b4c5d6e7f");

  test("最小人数のチームを選択する", () => {
    const teams: TeamWithMemberCount[] = [
      { teamId: TEST_TEAM_ID_1, memberCount: 3 },
      { teamId: TEST_TEAM_ID_2, memberCount: 2 },
      { teamId: TEST_TEAM_ID_3, memberCount: 4 },
    ];

    const result = selectTeamWithMinMembers(teams);

    expect(result).toEqual({ teamId: TEST_TEAM_ID_2, memberCount: 2 });
  });

  test("4名以上のチームは選択対象から除外される", () => {
    const teams: TeamWithMemberCount[] = [
      { teamId: TEST_TEAM_ID_1, memberCount: 4 },
      { teamId: TEST_TEAM_ID_2, memberCount: 4 },
    ];

    const result = selectTeamWithMinMembers(teams);

    expect(result).toBeUndefined();
  });

  test("空のリストの場合は undefined を返す", () => {
    const result = selectTeamWithMinMembers([]);

    expect(result).toBeUndefined();
  });

  test("同じ人数のチームがある場合はいずれかが選択される", () => {
    const teams: TeamWithMemberCount[] = [
      { teamId: TEST_TEAM_ID_1, memberCount: 2 },
      { teamId: TEST_TEAM_ID_2, memberCount: 2 },
    ];

    const result = selectTeamWithMinMembers(teams);

    expect(result?.memberCount).toBe(2);
    expect([TEST_TEAM_ID_1, TEST_TEAM_ID_2]).toContain(result?.teamId);
  });
});

describe("splitTeamMembers", () => {
  /**
   * テスト用のメンバーリストです。
   */
  const TEST_MEMBERS: TeamMemberInfo[] = [
    { participantId: "p1", name: "山田太郎" },
    { participantId: "p2", name: "鈴木花子" },
    { participantId: "p3", name: "佐藤次郎" },
    { participantId: "p4", name: "田中三郎" },
    { participantId: "p5", name: "高橋四郎" },
  ];

  test("5人のメンバーを3人と2人に分割する", () => {
    const result = splitTeamMembers(TEST_MEMBERS);

    expect(result.originalTeamMembers.length).toBe(3);
    expect(result.newTeamMembers.length).toBe(2);
  });

  test("分割後のメンバーの合計は元のメンバー数と同じ", () => {
    const result = splitTeamMembers(TEST_MEMBERS);

    const allMembers = [...result.originalTeamMembers, ...result.newTeamMembers];
    expect(allMembers.length).toBe(TEST_MEMBERS.length);
  });

  test("全てのメンバーが分割後に存在する", () => {
    const result = splitTeamMembers(TEST_MEMBERS);

    const allMemberIds = [
      ...result.originalTeamMembers.map((m) => m.participantId),
      ...result.newTeamMembers.map((m) => m.participantId),
    ];

    for (const member of TEST_MEMBERS) {
      expect(allMemberIds).toContain(member.participantId);
    }
  });

  test("4人のメンバーを2人と2人に分割する", () => {
    const members = TEST_MEMBERS.slice(0, 4);
    const result = splitTeamMembers(members);

    expect(result.originalTeamMembers.length).toBe(2);
    expect(result.newTeamMembers.length).toBe(2);
  });
});

describe("generateNextTeamName", () => {
  test("使用されていない最初の名前を生成する", () => {
    const usedNames = [TeamName("a"), TeamName("b"), TeamName("c")];
    const result = generateNextTeamName(usedNames);

    expect(result).toBe("d");
  });

  test("名前が空の場合は'a'を生成する", () => {
    const result = generateNextTeamName([]);

    expect(result).toBe("a");
  });

  test("間に空きがある場合はその名前を生成する", () => {
    const usedNames = [TeamName("a"), TeamName("c"), TeamName("d")];
    const result = generateNextTeamName(usedNames);

    expect(result).toBe("b");
  });

  test("全ての文字が使用されている場合はエラーをスローする", () => {
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    const usedNames = alphabet.split("").map((letter) => TeamName(letter));

    expect(() => generateNextTeamName(usedNames)).toThrow("利用可能なチーム名がありません。");
  });
});
