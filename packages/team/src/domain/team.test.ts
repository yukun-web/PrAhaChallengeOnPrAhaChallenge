import { ValidationError } from "@ponp/fundamental";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { TeamEventType } from "./events";
import { Team, TeamId, TeamName } from "./team";

describe("TeamId", () => {
  /**
   * テストに使用する有効な UUID です。
   */
  const TEST_VALID_UUID = "87292b7f-ca43-4a41-b00f-7b73869d7026";

  /**
   * テストに使用する無効な UUID です。
   */
  const TEST_INVALID_UUID = "invalid-uuid";

  test("有効な UUID から生成できる", () => {
    const teamId = TeamId(TEST_VALID_UUID);

    expect(teamId).toBe(TEST_VALID_UUID);
  });

  test("無効な形式の場合は ValidationError をスローする", () => {
    expect(() => TeamId(TEST_INVALID_UUID)).toThrow(ValidationError);
  });

  test("generate() で新しい ID を生成できる", () => {
    const teamId = TeamId.generate();

    expect(teamId).toBeDefined();
    expect(typeof teamId).toBe("string");
    expect(teamId.length).toBe(36);
  });
});

describe("TeamName", () => {
  /**
   * テストに使用する有効なチーム名です。
   */
  const TEST_VALID_NAME = "a";

  /**
   * テストに使用する空のチーム名です。
   */
  const TEST_EMPTY_NAME = "";

  /**
   * テストに使用する長すぎるチーム名です。
   */
  const TEST_TOO_LONG_NAME = "ab";

  test("有効な名前から生成できる", () => {
    const teamName = TeamName(TEST_VALID_NAME);

    expect(teamName).toBe(TEST_VALID_NAME);
  });

  test("空文字の場合は ValidationError をスローする", () => {
    expect(() => TeamName(TEST_EMPTY_NAME)).toThrow(ValidationError);
  });

  test("1文字を超える場合は ValidationError をスローする", () => {
    expect(() => TeamName(TEST_TOO_LONG_NAME)).toThrow(ValidationError);
  });
});

describe("Team", () => {
  /**
   * テストに使用する有効な UUID です。
   */
  const TEST_VALID_UUID = "87292b7f-ca43-4a41-b00f-7b73869d7026";

  /**
   * テストに使用する有効なチーム名です。
   */
  const TEST_VALID_NAME = "a";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    test("チームを作成できる", () => {
      const [team, event] = Team.create({
        name: TeamName(TEST_VALID_NAME),
      });

      expect(team.id).toBeDefined();
      expect(team.name).toBe(TEST_VALID_NAME);
      expect(event.type).toBe(TeamEventType.CREATED);
      expect(event.teamId).toBe(team.id);
      expect(event.name).toBe(TEST_VALID_NAME);
      expect(event.createdAt).toBeInstanceOf(Date);
    });
  });

  describe("reconstruct", () => {
    test("チームを再構築できる", () => {
      const team = Team.reconstruct({
        id: TEST_VALID_UUID,
        name: TEST_VALID_NAME,
      });

      expect(team.id).toBe(TEST_VALID_UUID);
      expect(team.name).toBe(TEST_VALID_NAME);
    });

    test("無効な ID の場合は ValidationError をスローする", () => {
      expect(() =>
        Team.reconstruct({
          id: "invalid-uuid",
          name: TEST_VALID_NAME,
        }),
      ).toThrow(ValidationError);
    });

    test("無効な名前の場合は ValidationError をスローする", () => {
      expect(() =>
        Team.reconstruct({
          id: TEST_VALID_UUID,
          name: "",
        }),
      ).toThrow(ValidationError);
    });
  });
});
