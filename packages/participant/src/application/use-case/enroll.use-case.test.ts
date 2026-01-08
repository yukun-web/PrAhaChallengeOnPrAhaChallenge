import { ValidationError } from "@ponp/fundamental";
import { spyUuid } from "@ponp/testing";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { ParticipantStatus } from "../../domain";
import { participantEventPublisherMock } from "../port/event-publisher.port.mock";
import { participantRepositoryMock } from "../port/participant.repository.mock";
import type { ExecuteEnrollUseCase } from "./enroll.use-case";
import { createEnrollUseCase } from "./enroll.use-case";

describe("参加者入会ユースケース", () => {
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
   * テストに使用する不正なメールアドレスです。
   */
  const TEST_INVALID_EMAIL = "invalid-email";

  /**
   * ユースケースの実行関数です。
   */
  let executeUseCase: ExecuteEnrollUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    executeUseCase = createEnrollUseCase({
      participantRepository: participantRepositoryMock,
      participantEventPublisher: participantEventPublisherMock,
    });
  });

  test("参加者の入会時にリポジトリへ保存する", async () => {
    spyUuid(TEST_PARTICIPANT_ID);

    await executeUseCase({ name: TEST_PARTICIPANT_NAME, email: TEST_PARTICIPANT_EMAIL });

    expect(participantRepositoryMock.save).toHaveBeenCalledExactlyOnceWith({
      id: TEST_PARTICIPANT_ID,
      name: TEST_PARTICIPANT_NAME,
      email: TEST_PARTICIPANT_EMAIL,
      status: ParticipantStatus.ACTIVE,
    });
  });

  test("参加者の入会時にイベントを発行する", async () => {
    spyUuid(TEST_PARTICIPANT_ID);

    await executeUseCase({ name: TEST_PARTICIPANT_NAME, email: TEST_PARTICIPANT_EMAIL });

    expect(participantEventPublisherMock.publishEnrolled).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        participantId: TEST_PARTICIPANT_ID,
        name: TEST_PARTICIPANT_NAME,
        enrolledAt: expect.any(Date),
      }),
    );
  });

  test("不正なメールアドレスの場合はエラーを返し保存もイベント発行もしない", async () => {
    const act = () => executeUseCase({ name: TEST_PARTICIPANT_NAME, email: TEST_INVALID_EMAIL });

    await expect(act).rejects.toBeInstanceOf(ValidationError);
    expect(participantRepositoryMock.save).not.toHaveBeenCalled();
    expect(participantEventPublisherMock.publishEnrolled).not.toHaveBeenCalled();
  });
});
