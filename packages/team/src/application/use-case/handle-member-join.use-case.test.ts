import { DomainError } from "@ponp/fundamental";
import { describe, expect, test, vi } from "vitest";

import { TeamId } from "../../domain";
import type { ParticipantAssignment } from "../port/participant-assignment";
import type { TeamMemberCountQuery } from "../port/team-member-count.query";
import { createHandleMemberJoinUseCase } from "./handle-member-join.use-case";

describe("createHandleMemberJoinUseCase", () => {
  /**
   * テスト用のチームIDです。
   */
  const TEST_TEAM_ID = "a1b2c3d4-e5f6-4a7b-ac9d-0e1f2a3b4c5d";

  /**
   * テスト用の参加者IDです。
   */
  const TEST_PARTICIPANT_ID = "b2c3d4e5-f6a7-4b8c-ad0e-1f2a3b4c5d6e";

  /**
   * テスト用のモック依存関係を作成します。
   */
  const createMockDependencies = () => {
    const teamMemberCountQuery: TeamMemberCountQuery = {
      getTeamMemberCount: vi.fn(),
      getTeamMembers: vi.fn(),
      getAllTeamMemberCounts: vi.fn(),
    };

    const participantAssignment: ParticipantAssignment = {
      assignToTeam: vi.fn(),
    };

    const splitTeam = vi.fn();

    return { teamMemberCountQuery, participantAssignment, splitTeam };
  };

  test("最小人数のチームに参加者を割り当てる", async () => {
    const deps = createMockDependencies();
    vi.mocked(deps.teamMemberCountQuery.getAllTeamMemberCounts).mockResolvedValue([
      { teamId: TeamId(TEST_TEAM_ID), count: 2 },
      { teamId: TeamId("c3d4e5f6-a7b8-4c9d-ae1f-2a3b4c5d6e7f"), count: 3 },
    ]);

    const useCase = createHandleMemberJoinUseCase(deps);
    const result = await useCase({ participantId: TEST_PARTICIPANT_ID });

    expect(result).toEqual({
      assignedTeamId: TeamId(TEST_TEAM_ID),
      teamWasSplit: false,
    });
    expect(deps.participantAssignment.assignToTeam).toHaveBeenCalledWith({
      participantId: TEST_PARTICIPANT_ID,
      teamId: TeamId(TEST_TEAM_ID),
    });
    expect(deps.splitTeam).not.toHaveBeenCalled();
  });

  test("4名のチームには割り当てできない（最大人数なので選択対象外）", async () => {
    const deps = createMockDependencies();
    // 4名のチームしかない場合は割り当て不可
    vi.mocked(deps.teamMemberCountQuery.getAllTeamMemberCounts).mockResolvedValue([
      { teamId: TeamId(TEST_TEAM_ID), count: 4 },
    ]);

    const useCase = createHandleMemberJoinUseCase(deps);

    await expect(useCase({ participantId: TEST_PARTICIPANT_ID })).rejects.toThrow(DomainError);
  });

  test("3名のチームに割り当てると4名になるが分割は不要", async () => {
    const deps = createMockDependencies();
    vi.mocked(deps.teamMemberCountQuery.getAllTeamMemberCounts).mockResolvedValue([
      { teamId: TeamId(TEST_TEAM_ID), count: 3 }, // 割り当て後4名
    ]);

    const useCase = createHandleMemberJoinUseCase(deps);
    const result = await useCase({ participantId: TEST_PARTICIPANT_ID });

    expect(result).toEqual({
      assignedTeamId: TeamId(TEST_TEAM_ID),
      teamWasSplit: false,
    });
    expect(deps.splitTeam).not.toHaveBeenCalled();
  });

  test("割り当て可能なチームが存在しない場合はエラーをスローする", async () => {
    const deps = createMockDependencies();
    // 全てのチームが4名以上
    vi.mocked(deps.teamMemberCountQuery.getAllTeamMemberCounts).mockResolvedValue([
      { teamId: TeamId(TEST_TEAM_ID), count: 4 },
      { teamId: TeamId("c3d4e5f6-a7b8-4c9d-ae1f-2a3b4c5d6e7f"), count: 4 },
    ]);

    const useCase = createHandleMemberJoinUseCase(deps);

    await expect(useCase({ participantId: TEST_PARTICIPANT_ID })).rejects.toThrow(DomainError);
    await expect(useCase({ participantId: TEST_PARTICIPANT_ID })).rejects.toThrow(
      "割り当て可能なチームが存在しません",
    );
  });

  test("チームが空の配列の場合はエラーをスローする", async () => {
    const deps = createMockDependencies();
    vi.mocked(deps.teamMemberCountQuery.getAllTeamMemberCounts).mockResolvedValue([]);

    const useCase = createHandleMemberJoinUseCase(deps);

    await expect(useCase({ participantId: TEST_PARTICIPANT_ID })).rejects.toThrow(DomainError);
  });

  test("同じ人数のチームがある場合でも最小人数チームに割り当てる", async () => {
    const deps = createMockDependencies();
    vi.mocked(deps.teamMemberCountQuery.getAllTeamMemberCounts).mockResolvedValue([
      { teamId: TeamId(TEST_TEAM_ID), count: 2 },
      { teamId: TeamId("c3d4e5f6-a7b8-4c9d-ae1f-2a3b4c5d6e7f"), count: 2 },
    ]);

    const useCase = createHandleMemberJoinUseCase(deps);
    const result = await useCase({ participantId: TEST_PARTICIPANT_ID });

    // いずれかのチームに割り当てられる
    expect(result.assignedTeamId).toBeDefined();
    expect(deps.participantAssignment.assignToTeam).toHaveBeenCalled();
  });
});
