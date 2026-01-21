import { describe, expect, test, vi } from "vitest";

import { TeamId } from "../../domain";
import type { AdminNotifier } from "../port/admin-notifier";
import type { ParticipantAssignment } from "../port/participant-assignment";
import type { TeamMemberCountQuery } from "../port/team-member-count.query";
import { createHandleMemberLeaveUseCase } from "./handle-member-leave.use-case";

describe("createHandleMemberLeaveUseCase", () => {
  /**
   * テスト用のチームIDです。
   */
  const TEST_TEAM_ID = "a1b2c3d4-e5f6-4a7b-ac9d-0e1f2a3b4c5d";

  /**
   * テスト用の合流先チームIDです。
   */
  const MERGE_TARGET_TEAM_ID = "b2c3d4e5-f6a7-4b8c-ad0e-1f2a3b4c5d6e";

  /**
   * テスト用のモック依存関係を作成します。
   */
  const createMockDependencies = () => {
    const teamMemberCountQuery: TeamMemberCountQuery = {
      getTeamMemberCount: vi.fn(),
      getTeamMembers: vi.fn(),
      getAllTeamMemberCounts: vi.fn(),
    };

    const adminNotifier: AdminNotifier = {
      notifyTeamUnderMinimum: vi.fn(),
      notifyNoMergeTarget: vi.fn(),
    };

    const participantAssignment: ParticipantAssignment = {
      assignToTeam: vi.fn(),
    };

    return { teamMemberCountQuery, adminNotifier, participantAssignment };
  };

  test("離脱後のメンバーが2名以上の場合はOKを返す", async () => {
    const deps = createMockDependencies();
    vi.mocked(deps.teamMemberCountQuery.getTeamMemberCount).mockResolvedValue(3);

    const useCase = createHandleMemberLeaveUseCase(deps);
    const result = await useCase({
      leavingParticipantName: "山田太郎",
      teamId: TEST_TEAM_ID,
    });

    expect(result).toEqual({ type: "OK" });
    expect(deps.adminNotifier.notifyTeamUnderMinimum).not.toHaveBeenCalled();
  });

  test("離脱後のメンバーが2名の場合はOKを返す（最低人数なので正常）", async () => {
    const deps = createMockDependencies();
    vi.mocked(deps.teamMemberCountQuery.getTeamMemberCount).mockResolvedValue(2);

    const useCase = createHandleMemberLeaveUseCase(deps);
    const result = await useCase({
      leavingParticipantName: "山田太郎",
      teamId: TEST_TEAM_ID,
    });

    expect(result).toEqual({ type: "OK" });
    expect(deps.adminNotifier.notifyTeamUnderMinimum).not.toHaveBeenCalled();
  });

  test("離脱後のメンバーが1名の場合は自動合流処理を行いTEAM_NEEDS_MERGEを返す", async () => {
    const deps = createMockDependencies();
    vi.mocked(deps.teamMemberCountQuery.getTeamMemberCount).mockResolvedValue(1);
    vi.mocked(deps.teamMemberCountQuery.getTeamMembers).mockResolvedValue([
      { participantId: "p1", name: "鈴木花子" },
    ]);
    vi.mocked(deps.teamMemberCountQuery.getAllTeamMemberCounts).mockResolvedValue([
      { teamId: TeamId(TEST_TEAM_ID), count: 1 },
      { teamId: TeamId(MERGE_TARGET_TEAM_ID), count: 2 },
    ]);

    const useCase = createHandleMemberLeaveUseCase(deps);
    const result = await useCase({
      leavingParticipantName: "山田太郎",
      teamId: TEST_TEAM_ID,
    });

    expect(result).toEqual({
      type: "TEAM_NEEDS_MERGE",
      teamId: TeamId(TEST_TEAM_ID),
      soleParticipant: {
        id: "p1",
        name: "鈴木花子",
      },
    });
    expect(deps.participantAssignment.assignToTeam).toHaveBeenCalledWith({
      participantId: "p1",
      teamId: TeamId(MERGE_TARGET_TEAM_ID),
    });
  });

  test("離脱後のメンバーが1名で合流先がない場合は管理者に通知してNO_MERGE_TARGETを返す", async () => {
    const deps = createMockDependencies();
    vi.mocked(deps.teamMemberCountQuery.getTeamMemberCount).mockResolvedValue(1);
    vi.mocked(deps.teamMemberCountQuery.getTeamMembers).mockResolvedValue([
      { participantId: "p1", name: "鈴木花子" },
    ]);
    // 全てのチームが4名以上（合流不可）
    vi.mocked(deps.teamMemberCountQuery.getAllTeamMemberCounts).mockResolvedValue([
      { teamId: TeamId(TEST_TEAM_ID), count: 1 },
      { teamId: TeamId(MERGE_TARGET_TEAM_ID), count: 4 },
    ]);

    const useCase = createHandleMemberLeaveUseCase(deps);
    const result = await useCase({
      leavingParticipantName: "山田太郎",
      teamId: TEST_TEAM_ID,
    });

    expect(result).toEqual({
      type: "NO_MERGE_TARGET",
      soleParticipant: {
        id: "p1",
        name: "鈴木花子",
      },
    });
    expect(deps.adminNotifier.notifyNoMergeTarget).toHaveBeenCalledWith({
      leavingParticipantName: "山田太郎",
      soleParticipantName: "鈴木花子",
    });
    expect(deps.participantAssignment.assignToTeam).not.toHaveBeenCalled();
  });

  test("離脱後のメンバーが0名の場合はOKを返す", async () => {
    const deps = createMockDependencies();
    vi.mocked(deps.teamMemberCountQuery.getTeamMemberCount).mockResolvedValue(0);

    const useCase = createHandleMemberLeaveUseCase(deps);
    const result = await useCase({
      leavingParticipantName: "山田太郎",
      teamId: TEST_TEAM_ID,
    });

    expect(result).toEqual({ type: "OK" });
  });

  test("合流先の選択では自身のチームを除外する", async () => {
    const deps = createMockDependencies();
    vi.mocked(deps.teamMemberCountQuery.getTeamMemberCount).mockResolvedValue(1);
    vi.mocked(deps.teamMemberCountQuery.getTeamMembers).mockResolvedValue([
      { participantId: "p1", name: "鈴木花子" },
    ]);
    // 自身のチームと合流先候補
    vi.mocked(deps.teamMemberCountQuery.getAllTeamMemberCounts).mockResolvedValue([
      { teamId: TeamId(TEST_TEAM_ID), count: 1 }, // 自身のチーム
      { teamId: TeamId(MERGE_TARGET_TEAM_ID), count: 3 }, // 合流先
    ]);

    const useCase = createHandleMemberLeaveUseCase(deps);
    await useCase({
      leavingParticipantName: "山田太郎",
      teamId: TEST_TEAM_ID,
    });

    // 合流先は自身のチーム以外の最小人数チーム
    expect(deps.participantAssignment.assignToTeam).toHaveBeenCalledWith({
      participantId: "p1",
      teamId: TeamId(MERGE_TARGET_TEAM_ID),
    });
  });
});
