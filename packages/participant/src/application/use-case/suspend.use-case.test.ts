import { DomainError, ValidationError } from "@ponp/fundamental";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { ParticipantStatus } from "../../domain";
import { createDummyParticipant } from "../../domain/testing";
import { eventPublisherMock } from "../port/event-publisher.mock";
import { participantRepositoryMock } from "../port/participant.repository.mock";
import type { ExecuteSuspendUseCase } from "./suspend.use-case";
import { createSuspendUseCase } from "./suspend.use-case";

describe("参加者休会ユースケース", () => {
  /**
   * テストに使用する未存在の参加者 ID です。
   */
  const TEST_NOT_FOUND_PARTICIPANT_ID = "2bc35053-b6d1-4f1f-8e8f-fca8b6b55a94";

  /**
   * テストに使用する不正な参加者 ID です。
   */
  const TEST_INVALID_PARTICIPANT_ID = "invalid-uuid";
  /**
   * ユースケースの実行関数です。
   */
  let executeUseCase: ExecuteSuspendUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    executeUseCase = createSuspendUseCase({
      participantRepository: participantRepositoryMock,
      eventPublisher: eventPublisherMock,
    });
  });

  test("参加者を休会状態にして保存する", async () => {
    const participant = createDummyParticipant({ status: ParticipantStatus.ACTIVE });
    participantRepositoryMock.findById.mockResolvedValue(participant);

    await executeUseCase({ participantId: participant.id });

    expect(participantRepositoryMock.save).toHaveBeenCalledExactlyOnceWith({
      ...participant,
      status: ParticipantStatus.SUSPENDED,
    });
  });

  test("参加者の休会時にイベントを発行する", async () => {
    const participant = createDummyParticipant({ status: ParticipantStatus.ACTIVE });
    participantRepositoryMock.findById.mockResolvedValue(participant);

    await executeUseCase({ participantId: participant.id });

    expect(eventPublisherMock.publish).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        participantId: participant.id,
        name: participant.name,
        suspendedAt: expect.any(Date),
      }),
    );
  });

  test("存在しない参加者 ID の場合はエラーを返し保存もイベント発行もしない", async () => {
    participantRepositoryMock.findById.mockResolvedValue(undefined);

    const act = () => executeUseCase({ participantId: TEST_NOT_FOUND_PARTICIPANT_ID });

    await expect(act).rejects.toBeInstanceOf(DomainError);
    expect(participantRepositoryMock.save).not.toHaveBeenCalled();
    expect(eventPublisherMock.publish).not.toHaveBeenCalled();
  });

  test("不正な参加者 ID の場合はバリデーションエラーを返し保存もイベント発行もしない", async () => {
    const act = () => executeUseCase({ participantId: TEST_INVALID_PARTICIPANT_ID });

    await expect(act).rejects.toBeInstanceOf(ValidationError);
    expect(participantRepositoryMock.save).not.toHaveBeenCalled();
    expect(participantRepositoryMock.findById).not.toHaveBeenCalled();
    expect(eventPublisherMock.publish).not.toHaveBeenCalled();
  });

  test("在籍中以外の参加者の場合はドメインエラーを返し保存もイベント発行もしない", async () => {
    const participant = createDummyParticipant({ status: ParticipantStatus.SUSPENDED });
    participantRepositoryMock.findById.mockResolvedValue(participant);

    const act = () => executeUseCase({ participantId: participant.id });

    await expect(act).rejects.toBeInstanceOf(DomainError);
    expect(participantRepositoryMock.save).not.toHaveBeenCalled();
    expect(eventPublisherMock.publish).not.toHaveBeenCalled();
  });
});
