import { DomainError, ValidationError } from "@ponp/fundamental";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { ParticipantStatus } from "../../domain";
import { createDummyParticipant } from "../../domain/testing";
import { participantEventPublisherMock } from "../port/event-publisher.port.mock";
import { participantRepositoryMock } from "../port/participant.repository.mock";
import type { ExecuteWithdrawUseCase } from "./withdraw.use-case";
import { createWithdrawUseCase } from "./withdraw.use-case";

describe("参加者退会ユースケース", () => {
  /**
   * テストに使用する未存在の参加者 ID です。
   */
  const TEST_NOT_FOUND_PARTICIPANT_ID = "7afa4781-7a43-432a-9892-76b455cdaf4e";

  /**
   * テストに使用する不正な参加者 ID です。
   */
  const TEST_INVALID_PARTICIPANT_ID = "invalid-uuid";
  /**
   * ユースケースの実行関数です。
   */
  let executeUseCase: ExecuteWithdrawUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    executeUseCase = createWithdrawUseCase({
      participantRepository: participantRepositoryMock,
      participantEventPublisher: participantEventPublisherMock,
    });
  });

  test("参加者を退会状態にして保存する", async () => {
    const participant = createDummyParticipant({ status: ParticipantStatus.ACTIVE });
    participantRepositoryMock.findById.mockResolvedValue(participant);

    await executeUseCase({ participantId: participant.id });

    expect(participantRepositoryMock.save).toHaveBeenCalledExactlyOnceWith({
      ...participant,
      status: ParticipantStatus.WITHDRAWN,
    });
  });

  test("参加者の退会時にイベントを発行する", async () => {
    const participant = createDummyParticipant({ status: ParticipantStatus.ACTIVE });
    participantRepositoryMock.findById.mockResolvedValue(participant);

    await executeUseCase({ participantId: participant.id });

    expect(participantEventPublisherMock.publishWithdrawn).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        participantId: participant.id,
        name: participant.name,
        withdrawnAt: expect.any(Date),
      }),
    );
  });

  test("存在しない参加者 ID の場合はエラーを返し保存もイベント発行もしない", async () => {
    participantRepositoryMock.findById.mockResolvedValue(undefined);

    const act = () => executeUseCase({ participantId: TEST_NOT_FOUND_PARTICIPANT_ID });

    await expect(act).rejects.toBeInstanceOf(DomainError);
    expect(participantRepositoryMock.save).not.toHaveBeenCalled();
    expect(participantEventPublisherMock.publishWithdrawn).not.toHaveBeenCalled();
  });

  test("不正な参加者 ID の場合はバリデーションエラーを返し保存もイベント発行もしない", async () => {
    const act = () => executeUseCase({ participantId: TEST_INVALID_PARTICIPANT_ID });

    await expect(act).rejects.toBeInstanceOf(ValidationError);
    expect(participantRepositoryMock.save).not.toHaveBeenCalled();
    expect(participantRepositoryMock.findById).not.toHaveBeenCalled();
    expect(participantEventPublisherMock.publishWithdrawn).not.toHaveBeenCalled();
  });

  test("既に退会済みの参加者の場合はドメインエラーを返し保存もイベント発行もしない", async () => {
    const participant = createDummyParticipant({ status: ParticipantStatus.WITHDRAWN });
    participantRepositoryMock.findById.mockResolvedValue(participant);

    const act = () => executeUseCase({ participantId: participant.id });

    await expect(act).rejects.toBeInstanceOf(DomainError);
    expect(participantRepositoryMock.save).not.toHaveBeenCalled();
    expect(participantEventPublisherMock.publishWithdrawn).not.toHaveBeenCalled();
  });
});
