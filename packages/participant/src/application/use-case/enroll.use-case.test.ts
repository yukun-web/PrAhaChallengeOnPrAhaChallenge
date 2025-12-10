import { ValidationError } from "@ponp/fundamental";
import { spyUuid } from "@ponp/testing";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { ParticipantStatus } from "../../domain";
import { mockParticipantRepository } from "../../infrastructure/testing";
import type { ExecuteEnrollUseCase } from "./enroll.use-case";
import { createEnrollUseCase } from "./enroll.use-case";

describe("createEnrollUseCase", () => {
  /**
   * テストに使用する参加者IDです。
   * テスト中の UUID の生成をスパイして、この値を返すようにします。
   */
  const TEST_PARTICIPANT_ID = "87292b7f-ca43-4a41-b00f-7b73869d7026";

  /**
   * テストに使用する参加者の名前です。
   */
  const TEST_PARTICIPANT_NAME = "Taro Yamada";

  /**
   * テストに使用する参加者のメールアドレスです。
   */
  const TEST_PARTICIPANT_EMAIL = "taro@example.com";

  /**
   * ユースケースの実行関数です。
   */
  let executeUseCase: ExecuteEnrollUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    executeUseCase = createEnrollUseCase({ participantRepository: mockParticipantRepository });
  });

  test("参加者の入会時にリポジトリへ保存する", async () => {
    spyUuid(TEST_PARTICIPANT_ID);

    await executeUseCase({ name: TEST_PARTICIPANT_NAME, email: TEST_PARTICIPANT_EMAIL });

    expect(mockParticipantRepository.save).toHaveBeenCalledExactlyOnceWith({
      id: TEST_PARTICIPANT_ID,
      name: TEST_PARTICIPANT_NAME,
      email: TEST_PARTICIPANT_EMAIL,
      status: ParticipantStatus.ACTIVE,
    });
  });

  test("不正なメールアドレスの場合はエラーを返し保存しない", async () => {
    const INVALID_EMAIL = "invalid-email";

    const act = () => executeUseCase({ name: TEST_PARTICIPANT_NAME, email: INVALID_EMAIL });

    await expect(act).rejects.toBeInstanceOf(ValidationError);
    expect(mockParticipantRepository.save).not.toHaveBeenCalled();
  });
});
