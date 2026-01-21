import { DomainError } from "@ponp/fundamental";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { TeamName } from "../../domain";
import { createDummyTeam } from "../../domain/testing";
import { teamRepositoryMock } from "../port/team.repository.mock";
import { createEnsureTeamNameNotDuplicated } from "./ensure-team-name-not-duplicated";

describe("チーム名重複チェックドメインサービス", () => {
  /**
   * テストに使用するチーム名です。
   */
  const TEST_TEAM_NAME = TeamName("a");

  /**
   * ドメインサービスの実行関数です。
   */
  let ensureTeamNameNotDuplicated: ReturnType<typeof createEnsureTeamNameNotDuplicated>;

  beforeEach(() => {
    vi.clearAllMocks();
    ensureTeamNameNotDuplicated = createEnsureTeamNameNotDuplicated(teamRepositoryMock);
  });

  test("チーム名が重複していない場合は正常終了する", async () => {
    teamRepositoryMock.findByName.mockResolvedValue(undefined);

    await expect(ensureTeamNameNotDuplicated(TEST_TEAM_NAME)).resolves.toBeUndefined();

    expect(teamRepositoryMock.findByName).toHaveBeenCalledExactlyOnceWith(TEST_TEAM_NAME);
  });

  test("チーム名が既に登録されている場合は DomainError をスローする", async () => {
    const existingTeam = createDummyTeam({ name: "a" });
    teamRepositoryMock.findByName.mockResolvedValue(existingTeam);

    const act = ensureTeamNameNotDuplicated(TEST_TEAM_NAME);

    await expect(act).rejects.toBeInstanceOf(DomainError);
    await expect(act).rejects.toMatchObject({
      code: "TEAM_NAME_ALREADY_EXISTS",
    });
  });
});
