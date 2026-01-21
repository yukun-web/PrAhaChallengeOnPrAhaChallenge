import { DomainError } from "@ponp/fundamental";
import { describe, expect, test, vi } from "vitest";

import { Team, TeamId, TeamName } from "../../domain";
import type { ParticipantAssignment } from "../port/participant-assignment";
import type { TeamMemberCountQuery } from "../port/team-member-count.query";
import type { TeamRepository } from "../port/team.repository";
import { createSplitTeamUseCase } from "./split-team.use-case";

describe("createSplitTeamUseCase", () => {
  /**
   * テスト用のチームIDです。
   */
  const TEST_TEAM_ID = "a1b2c3d4-e5f6-4a7b-ac9d-0e1f2a3b4c5d";

  /**
   * テスト用の5人のメンバーです。
   */
  const TEST_MEMBERS = [
    { participantId: "p1", name: "山田太郎" },
    { participantId: "p2", name: "鈴木花子" },
    { participantId: "p3", name: "佐藤次郎" },
    { participantId: "p4", name: "田中三郎" },
    { participantId: "p5", name: "高橋四郎" },
  ];

  /**
   * テスト用のモック依存関係を作成します。
   */
  const createMockDependencies = () => {
    const teamRepository: TeamRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
    };

    const teamMemberCountQuery: TeamMemberCountQuery = {
      getTeamMemberCount: vi.fn(),
      getTeamMembers: vi.fn(),
      getAllTeamMemberCounts: vi.fn(),
    };

    const participantAssignment: ParticipantAssignment = {
      assignToTeam: vi.fn(),
    };

    return { teamRepository, teamMemberCountQuery, participantAssignment };
  };

  test("5人のチームを3人と2人に分割する", async () => {
    const deps = createMockDependencies();
    vi.mocked(deps.teamMemberCountQuery.getTeamMembers).mockResolvedValue(TEST_MEMBERS);
    vi.mocked(deps.teamRepository.findAll).mockResolvedValue([
      Team.reconstruct({ id: TEST_TEAM_ID, name: "a" }),
    ]);

    const useCase = createSplitTeamUseCase(deps);
    await useCase({ teamId: TEST_TEAM_ID });

    // 新しいチームが保存される
    expect(deps.teamRepository.save).toHaveBeenCalledTimes(1);
    const savedTeam = vi.mocked(deps.teamRepository.save).mock.calls[0]?.[0];
    expect(savedTeam).toBeDefined();
    expect(savedTeam?.name).toBe(TeamName("b")); // 次のアルファベット

    // 2人が新しいチームに移動
    expect(deps.participantAssignment.assignToTeam).toHaveBeenCalledTimes(2);
  });

  test("メンバーが5人未満の場合はエラーをスローする", async () => {
    const deps = createMockDependencies();
    vi.mocked(deps.teamMemberCountQuery.getTeamMembers).mockResolvedValue([
      { participantId: "p1", name: "山田太郎" },
      { participantId: "p2", name: "鈴木花子" },
      { participantId: "p3", name: "佐藤次郎" },
      { participantId: "p4", name: "田中三郎" },
    ]);

    const useCase = createSplitTeamUseCase(deps);

    await expect(useCase({ teamId: TEST_TEAM_ID })).rejects.toThrow(DomainError);
    await expect(useCase({ teamId: TEST_TEAM_ID })).rejects.toThrow(
      "チームのメンバー数が5名未満のため分割できません",
    );
  });

  test("新しいチーム名は既存のチーム名の次のアルファベットになる", async () => {
    const deps = createMockDependencies();
    vi.mocked(deps.teamMemberCountQuery.getTeamMembers).mockResolvedValue(TEST_MEMBERS);
    vi.mocked(deps.teamRepository.findAll).mockResolvedValue([
      Team.reconstruct({ id: TEST_TEAM_ID, name: "a" }),
      Team.reconstruct({ id: "b2c3d4e5-f6a7-4b8c-ad0e-1f2a3b4c5d6e", name: "b" }),
      Team.reconstruct({ id: "c3d4e5f6-a7b8-4c9d-ae1f-2a3b4c5d6e7f", name: "c" }),
    ]);

    const useCase = createSplitTeamUseCase(deps);
    await useCase({ teamId: TEST_TEAM_ID });

    const savedTeam = vi.mocked(deps.teamRepository.save).mock.calls[0]?.[0];
    expect(savedTeam?.name).toBe(TeamName("d"));
  });

  test("チーム名に空きがある場合はその名前を使用する", async () => {
    const deps = createMockDependencies();
    vi.mocked(deps.teamMemberCountQuery.getTeamMembers).mockResolvedValue(TEST_MEMBERS);
    // "b"が欠けている
    vi.mocked(deps.teamRepository.findAll).mockResolvedValue([
      Team.reconstruct({ id: TEST_TEAM_ID, name: "a" }),
      Team.reconstruct({ id: "c3d4e5f6-a7b8-4c9d-ae1f-2a3b4c5d6e7f", name: "c" }),
    ]);

    const useCase = createSplitTeamUseCase(deps);
    await useCase({ teamId: TEST_TEAM_ID });

    const savedTeam = vi.mocked(deps.teamRepository.save).mock.calls[0]?.[0];
    expect(savedTeam?.name).toBe(TeamName("b"));
  });

  test("新しいチームに移動するメンバーは2人である", async () => {
    const deps = createMockDependencies();
    vi.mocked(deps.teamMemberCountQuery.getTeamMembers).mockResolvedValue(TEST_MEMBERS);
    vi.mocked(deps.teamRepository.findAll).mockResolvedValue([
      Team.reconstruct({ id: TEST_TEAM_ID, name: "a" }),
    ]);

    const useCase = createSplitTeamUseCase(deps);
    await useCase({ teamId: TEST_TEAM_ID });

    // 2人が新しいチームに割り当てられる
    const assignCalls = vi.mocked(deps.participantAssignment.assignToTeam).mock.calls;
    expect(assignCalls.length).toBe(2);

    // 割り当てられた参加者IDはテストメンバーに含まれる
    const assignedParticipantIds = assignCalls.map((call) => call[0]?.participantId);
    for (const id of assignedParticipantIds) {
      expect(TEST_MEMBERS.map((m) => m.participantId)).toContain(id);
    }
  });
});
