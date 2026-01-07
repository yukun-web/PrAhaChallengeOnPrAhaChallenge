import { DomainError, ValidationError } from "@ponp/fundamental";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { ParticipantStatus } from "../../domain";
import { createDummyParticipant } from "../../domain/testing";
import { mockParticipantRepository } from "../../infrastructure/testing";
import type { ExecuteReactivateUseCase } from "./reactivate.use-case";
import { createReactivateUseCase } from "./reactivate.use-case";

describe("参加者復帰ユースケース", () => {
  /**
   * テストに使用する未存在の参加者 ID です。
   */
  const TEST_NOT_FOUND_PARTICIPANT_ID = "7db9e3cd-8c0d-4fe7-9b2b-8739f1a0de22";

  /**
   * テストに使用する不正な参加者 ID です。
   */
  const TEST_INVALID_PARTICIPANT_ID = "invalid-uuid";
  /**
   * ユースケースの実行関数です。
   */
  let executeUseCase: ExecuteReactivateUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    executeUseCase = createReactivateUseCase({ participantRepository: mockParticipantRepository });
  });

  test("休会中の参加者を復帰状態にして保存する", async () => {
    const participant = createDummyParticipant({ status: ParticipantStatus.SUSPENDED });
    mockParticipantRepository.findById.mockResolvedValue(participant);

    await executeUseCase({ participantId: participant.id });

    expect(mockParticipantRepository.save).toHaveBeenCalledExactlyOnceWith({
      ...participant,
      status: ParticipantStatus.ACTIVE,
    });
  });

  test("存在しない参加者 ID の場合はエラーを返し保存しない", async () => {
    mockParticipantRepository.findById.mockResolvedValue(undefined);

    const act = () => executeUseCase({ participantId: TEST_NOT_FOUND_PARTICIPANT_ID });

    await expect(act).rejects.toBeInstanceOf(DomainError);
    expect(mockParticipantRepository.save).not.toHaveBeenCalled();
  });

  test("不正な参加者 ID の場合はバリデーションエラーを返し保存しない", async () => {
    const act = () => executeUseCase({ participantId: TEST_INVALID_PARTICIPANT_ID });

    await expect(act).rejects.toBeInstanceOf(ValidationError);
    expect(mockParticipantRepository.save).not.toHaveBeenCalled();
    expect(mockParticipantRepository.findById).not.toHaveBeenCalled();
  });

  test("休会中以外の参加者の場合はドメインエラーを返し保存しない", async () => {
    const participant = createDummyParticipant({ status: ParticipantStatus.ACTIVE });
    mockParticipantRepository.findById.mockResolvedValue(participant);

    const act = () => executeUseCase({ participantId: participant.id });

    await expect(act).rejects.toBeInstanceOf(DomainError);
    expect(mockParticipantRepository.save).not.toHaveBeenCalled();
  });
});
