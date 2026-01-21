import { createEventConstructor } from "@ponp/event-bus";
import { z } from "zod";

/**
 * 参加者の入会イベントのペイロードスキーマです。
 */
export const ParticipantEnrolledSchema = z.object({
  participantId: z.string().uuid(),
  name: z.string().min(1),
  enrolledAt: z.coerce.date(),
});

/**
 * 参加者の休会イベントのペイロードスキーマです。
 */
export const ParticipantSuspendedSchema = z.object({
  participantId: z.string().uuid(),
  name: z.string().min(1),
  previousTeamId: z.string().uuid(),
  suspendedAt: z.coerce.date(),
});

/**
 * 参加者の復帰イベントのペイロードスキーマです。
 */
export const ParticipantReactivatedSchema = z.object({
  participantId: z.string().uuid(),
  name: z.string().min(1),
  reactivatedAt: z.coerce.date(),
});

/**
 * 参加者の退会イベントのペイロードスキーマです。
 */
export const ParticipantWithdrawnSchema = z.object({
  participantId: z.string().uuid(),
  name: z.string().min(1),
  previousTeamId: z.string().uuid(),
  withdrawnAt: z.coerce.date(),
});

/**
 * 参加者のチーム割り当てイベントのペイロードスキーマです。
 */
export const ParticipantTeamAssignedSchema = z.object({
  participantId: z.string().uuid(),
  name: z.string().min(1),
  teamId: z.string().uuid(),
  assignedAt: z.coerce.date(),
});

/**
 * 参加者の入会イベントのコンストラクタです。
 */
export const ParticipantEnrolledEvent = createEventConstructor(
  "PARTICIPANT_ENROLLED",
  ParticipantEnrolledSchema,
);

/**
 * 参加者の休会イベントのコンストラクタです。
 */
export const ParticipantSuspendedEvent = createEventConstructor(
  "PARTICIPANT_SUSPENDED",
  ParticipantSuspendedSchema,
);

/**
 * 参加者の復帰イベントのコンストラクタです。
 */
export const ParticipantReactivatedEvent = createEventConstructor(
  "PARTICIPANT_REACTIVATED",
  ParticipantReactivatedSchema,
);

/**
 * 参加者の退会イベントのコンストラクタです。
 */
export const ParticipantWithdrawnEvent = createEventConstructor(
  "PARTICIPANT_WITHDRAWN",
  ParticipantWithdrawnSchema,
);

/**
 * 参加者のチーム割り当てイベントのコンストラクタです。
 */
export const ParticipantTeamAssignedEvent = createEventConstructor(
  "PARTICIPANT_TEAM_ASSIGNED",
  ParticipantTeamAssignedSchema,
);

/**
 * 参加者の入会イベントのペイロード型です。
 */
export type ParticipantEnrolledPayload = z.infer<typeof ParticipantEnrolledSchema>;
/**
 * 参加者の休会イベントのペイロード型です。
 */
export type ParticipantSuspendedPayload = z.infer<typeof ParticipantSuspendedSchema>;
/**
 * 参加者の復帰イベントのペイロード型です。
 */
export type ParticipantReactivatedPayload = z.infer<typeof ParticipantReactivatedSchema>;
/**
 * 参加者の退会イベントのペイロード型です。
 */
export type ParticipantWithdrawnPayload = z.infer<typeof ParticipantWithdrawnSchema>;
/**
 * 参加者のチーム割り当てイベントのペイロード型です。
 */
export type ParticipantTeamAssignedPayload = z.infer<typeof ParticipantTeamAssignedSchema>;

/**
 * 参加者の入会イベントの型です。
 */
export type ParticipantEnrolledEvent = ReturnType<typeof ParticipantEnrolledEvent>;
/**
 * 参加者の休会イベントの型です。
 */
export type ParticipantSuspendedEvent = ReturnType<typeof ParticipantSuspendedEvent>;
/**
 * 参加者の復帰イベントの型です。
 */
export type ParticipantReactivatedEvent = ReturnType<typeof ParticipantReactivatedEvent>;
/**
 * 参加者の退会イベントの型です。
 */
export type ParticipantWithdrawnEvent = ReturnType<typeof ParticipantWithdrawnEvent>;
/**
 * 参加者のチーム割り当てイベントの型です。
 */
export type ParticipantTeamAssignedEvent = ReturnType<typeof ParticipantTeamAssignedEvent>;

/**
 * 参加者コンテキストの統合イベントのユニオン型です。
 */
export type ParticipantIntegrationEvent =
  | ParticipantEnrolledEvent
  | ParticipantSuspendedEvent
  | ParticipantReactivatedEvent
  | ParticipantWithdrawnEvent
  | ParticipantTeamAssignedEvent;
