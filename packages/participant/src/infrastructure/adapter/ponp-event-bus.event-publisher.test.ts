import type { EventBus } from "@ponp/event-bus";
import { InfrastructureError } from "@ponp/fundamental";
import { beforeEach, describe, expect, test, vi } from "vitest";

import type {
  ParticipantEnrolled,
  ParticipantReactivated,
  ParticipantSuspended,
  ParticipantWithdrawn,
} from "../../domain";
import { ParticipantEventType, ParticipantId, ParticipantName } from "../../domain";
import { PonpEventBusEventPublisher } from "./ponp-event-bus.event-publisher";

vi.mock("@ponp/event-bus", () => ({
  publish: vi.fn(),
}));

vi.mock("@ponp/integration-events", () => ({
  ParticipantEnrolledEvent: vi.fn((payload) => ({
    type: "PARTICIPANT_ENROLLED",
    id: "mock-event-id",
    payload,
  })),
  ParticipantSuspendedEvent: vi.fn((payload) => ({
    type: "PARTICIPANT_SUSPENDED",
    id: "mock-event-id",
    payload,
  })),
  ParticipantReactivatedEvent: vi.fn((payload) => ({
    type: "PARTICIPANT_REACTIVATED",
    id: "mock-event-id",
    payload,
  })),
  ParticipantWithdrawnEvent: vi.fn((payload) => ({
    type: "PARTICIPANT_WITHDRAWN",
    id: "mock-event-id",
    payload,
  })),
}));

import { publish } from "@ponp/event-bus";
import {
  ParticipantEnrolledEvent,
  ParticipantReactivatedEvent,
  ParticipantSuspendedEvent,
  ParticipantWithdrawnEvent,
} from "@ponp/integration-events";

describe("PonpEventBusEventPublisher", () => {
  /**
   * テスト用の参加者 ID です。
   */
  const TEST_PARTICIPANT_ID = "87292b7f-ca43-4a41-b00f-7b73869d7026";

  /**
   * テスト用の参加者名です。
   */
  const TEST_PARTICIPANT_NAME = "Taro Yamada";

  /**
   * テスト用の日時です。
   */
  const TEST_DATE = new Date("2024-01-01T00:00:00Z");

  /**
   * モックの EventBus です。
   */
  const mockEventBus = {} as EventBus;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("publish (入会イベント)", () => {
    test("ドメインイベントを integration-event に変換して発行する", async () => {
      const publisher = PonpEventBusEventPublisher({ eventBus: mockEventBus });
      const domainEvent: ParticipantEnrolled = {
        type: ParticipantEventType.ENROLLED,
        participantId: ParticipantId(TEST_PARTICIPANT_ID),
        name: ParticipantName(TEST_PARTICIPANT_NAME),
        enrolledAt: TEST_DATE,
      };

      await publisher.publish(domainEvent);

      expect(ParticipantEnrolledEvent).toHaveBeenCalledWith({
        participantId: TEST_PARTICIPANT_ID,
        name: TEST_PARTICIPANT_NAME,
        enrolledAt: TEST_DATE,
      });
      expect(publish).toHaveBeenCalledWith(
        mockEventBus,
        expect.objectContaining({
          type: "PARTICIPANT_ENROLLED",
        }),
      );
    });

    test("発行に失敗した場合は InfrastructureError をスローする", async () => {
      vi.mocked(publish).mockRejectedValueOnce(new Error("QStash error"));
      const publisher = PonpEventBusEventPublisher({ eventBus: mockEventBus });
      const domainEvent: ParticipantEnrolled = {
        type: ParticipantEventType.ENROLLED,
        participantId: ParticipantId(TEST_PARTICIPANT_ID),
        name: ParticipantName(TEST_PARTICIPANT_NAME),
        enrolledAt: TEST_DATE,
      };

      await expect(publisher.publish(domainEvent)).rejects.toBeInstanceOf(InfrastructureError);
    });
  });

  describe("publish (休会イベント)", () => {
    test("ドメインイベントを integration-event に変換して発行する", async () => {
      const publisher = PonpEventBusEventPublisher({ eventBus: mockEventBus });
      const domainEvent: ParticipantSuspended = {
        type: ParticipantEventType.SUSPENDED,
        participantId: ParticipantId(TEST_PARTICIPANT_ID),
        name: ParticipantName(TEST_PARTICIPANT_NAME),
        suspendedAt: TEST_DATE,
      };

      await publisher.publish(domainEvent);

      expect(ParticipantSuspendedEvent).toHaveBeenCalledWith({
        participantId: TEST_PARTICIPANT_ID,
        name: TEST_PARTICIPANT_NAME,
        suspendedAt: TEST_DATE,
      });
      expect(publish).toHaveBeenCalledWith(
        mockEventBus,
        expect.objectContaining({
          type: "PARTICIPANT_SUSPENDED",
        }),
      );
    });

    test("発行に失敗した場合は InfrastructureError をスローする", async () => {
      vi.mocked(publish).mockRejectedValueOnce(new Error("QStash error"));
      const publisher = PonpEventBusEventPublisher({ eventBus: mockEventBus });
      const domainEvent: ParticipantSuspended = {
        type: ParticipantEventType.SUSPENDED,
        participantId: ParticipantId(TEST_PARTICIPANT_ID),
        name: ParticipantName(TEST_PARTICIPANT_NAME),
        suspendedAt: TEST_DATE,
      };

      await expect(publisher.publish(domainEvent)).rejects.toBeInstanceOf(InfrastructureError);
    });
  });

  describe("publish (復帰イベント)", () => {
    test("ドメインイベントを integration-event に変換して発行する", async () => {
      const publisher = PonpEventBusEventPublisher({ eventBus: mockEventBus });
      const domainEvent: ParticipantReactivated = {
        type: ParticipantEventType.REACTIVATED,
        participantId: ParticipantId(TEST_PARTICIPANT_ID),
        name: ParticipantName(TEST_PARTICIPANT_NAME),
        reactivatedAt: TEST_DATE,
      };

      await publisher.publish(domainEvent);

      expect(ParticipantReactivatedEvent).toHaveBeenCalledWith({
        participantId: TEST_PARTICIPANT_ID,
        name: TEST_PARTICIPANT_NAME,
        reactivatedAt: TEST_DATE,
      });
      expect(publish).toHaveBeenCalledWith(
        mockEventBus,
        expect.objectContaining({
          type: "PARTICIPANT_REACTIVATED",
        }),
      );
    });

    test("発行に失敗した場合は InfrastructureError をスローする", async () => {
      vi.mocked(publish).mockRejectedValueOnce(new Error("QStash error"));
      const publisher = PonpEventBusEventPublisher({ eventBus: mockEventBus });
      const domainEvent: ParticipantReactivated = {
        type: ParticipantEventType.REACTIVATED,
        participantId: ParticipantId(TEST_PARTICIPANT_ID),
        name: ParticipantName(TEST_PARTICIPANT_NAME),
        reactivatedAt: TEST_DATE,
      };

      await expect(publisher.publish(domainEvent)).rejects.toBeInstanceOf(InfrastructureError);
    });
  });

  describe("publish (退会イベント)", () => {
    test("ドメインイベントを integration-event に変換して発行する", async () => {
      const publisher = PonpEventBusEventPublisher({ eventBus: mockEventBus });
      const domainEvent: ParticipantWithdrawn = {
        type: ParticipantEventType.WITHDRAWN,
        participantId: ParticipantId(TEST_PARTICIPANT_ID),
        name: ParticipantName(TEST_PARTICIPANT_NAME),
        withdrawnAt: TEST_DATE,
      };

      await publisher.publish(domainEvent);

      expect(ParticipantWithdrawnEvent).toHaveBeenCalledWith({
        participantId: TEST_PARTICIPANT_ID,
        name: TEST_PARTICIPANT_NAME,
        withdrawnAt: TEST_DATE,
      });
      expect(publish).toHaveBeenCalledWith(
        mockEventBus,
        expect.objectContaining({
          type: "PARTICIPANT_WITHDRAWN",
        }),
      );
    });

    test("発行に失敗した場合は InfrastructureError をスローする", async () => {
      vi.mocked(publish).mockRejectedValueOnce(new Error("QStash error"));
      const publisher = PonpEventBusEventPublisher({ eventBus: mockEventBus });
      const domainEvent: ParticipantWithdrawn = {
        type: ParticipantEventType.WITHDRAWN,
        participantId: ParticipantId(TEST_PARTICIPANT_ID),
        name: ParticipantName(TEST_PARTICIPANT_NAME),
        withdrawnAt: TEST_DATE,
      };

      await expect(publisher.publish(domainEvent)).rejects.toBeInstanceOf(InfrastructureError);
    });
  });
});
