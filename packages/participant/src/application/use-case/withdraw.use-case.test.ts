import { DomainError, ValidationError } from "@ponp/fundamental";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { ParticipantStatus } from "../../domain";
import { createDummyParticipant } from "../../domain/testing";
import { mockParticipantRepository } from "../../infrastructure/testing";
import type { ExecuteWithdrawUseCase } from "./withdraw.use-case";
import { createWithdrawUseCase } from "./withdraw.use-case";

describe("createWithdrawUseCase", () => {
  /**
   * ユースケースの実行関数です。
   */
  let executeUseCase: ExecuteWithdrawUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    executeUseCase = createWithdrawUseCase({ participantRepository: mockParticipantRepository });
  });

  test("参加者を退会状態にして保存する", async () => {
    const participant = createDummyParticipant({ status: ParticipantStatus.ACTIVE });
    mockParticipantRepository.findById.mockResolvedValue(participant);

    await executeUseCase({ participantId: participant.id });

    expect(mockParticipantRepository.save).toHaveBeenCalledExactlyOnceWith({
      ...participant,
      status: ParticipantStatus.WITHDRAWN,
    });
  });

  test("存在しない参加者 ID の場合はエラーを返し保存しない", async () => {
    mockParticipantRepository.findById.mockResolvedValue(undefined);

    const act = () => executeUseCase({ participantId: "7afa4781-7a43-432a-9892-76b455cdaf4e" });

    await expect(act).rejects.toBeInstanceOf(DomainError);
    expect(mockParticipantRepository.save).not.toHaveBeenCalled();
  });

  test("不正な参加者 ID の場合はバリデーションエラーを返し保存しない", async () => {
    const act = () => executeUseCase({ participantId: "invalid-uuid" });

    await expect(act).rejects.toBeInstanceOf(ValidationError);
    expect(mockParticipantRepository.save).not.toHaveBeenCalled();
    expect(mockParticipantRepository.findById).not.toHaveBeenCalled();
  });

  test("既に退会済みの参加者の場合はドメインエラーを返し保存しない", async () => {
    const participant = createDummyParticipant({ status: ParticipantStatus.WITHDRAWN });
    mockParticipantRepository.findById.mockResolvedValue(participant);

    const act = () => executeUseCase({ participantId: participant.id });

    await expect(act).rejects.toBeInstanceOf(DomainError);
    expect(mockParticipantRepository.save).not.toHaveBeenCalled();
  });
});
