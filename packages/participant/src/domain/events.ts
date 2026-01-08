import type { UnwrapNominalRecord } from "@ponp/fundamental";

import type { Participant } from "./participant";
import { ParticipantId, ParticipantName } from "./participant";

/* ---- イベントタイプ定数 ---- */

/**
 * 参加者ドメインイベントのタイプを表す定数です。
 */
export const ParticipantEventType = {
  ENROLLED: "PARTICIPANT_ENROLLED",
  SUSPENDED: "PARTICIPANT_SUSPENDED",
  REACTIVATED: "PARTICIPANT_REACTIVATED",
  WITHDRAWN: "PARTICIPANT_WITHDRAWN",
} as const;

/* ---- 型 ---- */

/**
 * 新しい参加者が入会したことを表すイベントです。
 */
export type ParticipantEnrolled = {
  /**
   * イベントのタイプです。
   */
  type: typeof ParticipantEventType.ENROLLED;

  /**
   * 入会した参加者の識別子です。
   * @see ParticipantId
   */
  participantId: ParticipantId;

  /**
   * 入会した参加者の名前です。
   * @see ParticipantName
   */
  name: ParticipantName;

  /**
   * 入会した日時です。
   */
  enrolledAt: Date;
};

/**
 * 在籍中の参加者が休会したことを表すイベントです。
 */
export type ParticipantSuspended = {
  /**
   * イベントのタイプです。
   */
  type: typeof ParticipantEventType.SUSPENDED;

  /**
   * 休会した参加者の識別子です。
   * @see ParticipantId
   */
  participantId: ParticipantId;

  /**
   * 休会した参加者の名前です。
   * @see ParticipantName
   */
  name: ParticipantName;

  /**
   * 休会した日時です。
   */
  suspendedAt: Date;
};

/**
 * 休会中の参加者が復帰したことを表すイベントです。
 */
export type ParticipantReactivated = {
  /**
   * イベントのタイプです。
   */
  type: typeof ParticipantEventType.REACTIVATED;

  /**
   * 復帰した参加者の識別子です。
   * @see ParticipantId
   */
  participantId: ParticipantId;

  /**
   * 復帰した参加者の名前です。
   * @see ParticipantName
   */
  name: ParticipantName;

  /**
   * 復帰した日時です。
   */
  reactivatedAt: Date;
};

/**
 * 参加者が退会したことを表すイベントです。
 */
export type ParticipantWithdrawn = {
  /**
   * イベントのタイプです。
   */
  type: typeof ParticipantEventType.WITHDRAWN;

  /**
   * 退会した参加者の識別子です。
   * @see ParticipantId
   */
  participantId: ParticipantId;

  /**
   * 退会した参加者の名前です。
   * @see ParticipantName
   */
  name: ParticipantName;

  /**
   * 退会した日時です。
   */
  withdrawnAt: Date;
};

/**
 * 参加者コンテキストのすべてのドメインイベントのユニオンです。
 */
export type ParticipantEvent =
  | ParticipantEnrolled
  | ParticipantSuspended
  | ParticipantReactivated
  | ParticipantWithdrawn;

/* ---- ファクトリ関数 ---- */

/**
 * 参加者の入会イベントの再構築に必要なパラメータです。
 */
type ParticipantEnrolledReconstructParams = UnwrapNominalRecord<ParticipantEnrolled>;

/**
 * 参加者入会イベントのコンストラクタです。
 *
 * @param params 参加者入会イベントのパラメータです。
 * @returns 参加者入会イベントのインスタンスを返します。
 */
export const ParticipantEnrolled = (params: ParticipantEnrolled) => {
  // イベント単位でのバリデーションなどがあればここに記述する。
  return params;
};

/**
 * 参加者の入会イベントのファクトリ関数です。
 *
 * @param params 参加者の入会イベントの再構築に必要なパラメータです。
 * @returns 値オブジェクトに変換された入会イベントを返します。
 */
ParticipantEnrolled.reconstruct = (
  params: ParticipantEnrolledReconstructParams,
): ParticipantEnrolled => {
  return ParticipantEnrolled({
    type: ParticipantEventType.ENROLLED,
    participantId: ParticipantId(params.participantId),
    name: ParticipantName(params.name),
    enrolledAt: params.enrolledAt,
  });
};

/**
 * 指定した参加者に対する入会イベントを作成します。
 *
 * @param participant 対象の参加者です。
 * @returns 新しい入会イベントを返します。
 */
ParticipantEnrolled.create = (participant: Participant): ParticipantEnrolled => {
  return ParticipantEnrolled({
    type: ParticipantEventType.ENROLLED,
    participantId: participant.id,
    name: participant.name,
    enrolledAt: new Date(),
  });
};

/**
 * 参加者の休会イベントのコンストラクターです。
 */
export const ParticipantSuspended = (params: ParticipantSuspended) => {
  // イベント単位でのバリデーションなどがあればここに記述する。
  return params;
};

/**
 * 参加者の休会イベントの再構築に必要なパラメータです。
 */
type ParticipantSuspendedReconstructParams = UnwrapNominalRecord<ParticipantSuspended>;

/**
 * 参加者の休会イベントのファクトリ関数です。
 *
 * @param params 参加者の休会イベントの再構築に必要なパラメータです。
 * @returns 値オブジェクトに変換された休会イベントを返します。
 */
ParticipantSuspended.reconstruct = (
  params: ParticipantSuspendedReconstructParams,
): ParticipantSuspended => {
  return ParticipantSuspended({
    type: ParticipantEventType.SUSPENDED,
    participantId: ParticipantId(params.participantId),
    name: ParticipantName(params.name),
    suspendedAt: params.suspendedAt,
  });
};

/**
 * 指定した参加者に対する休会イベントを作成します。
 *
 * @param participant 対象の参加者です。
 * @returns 新しい休会イベントを返します。
 */
ParticipantSuspended.create = (participant: Participant): ParticipantSuspended => {
  return ParticipantSuspended({
    type: ParticipantEventType.SUSPENDED,
    participantId: participant.id,
    name: participant.name,
    suspendedAt: new Date(),
  });
};

/**
 * 参加者の復帰イベントの再構築に必要なパラメータです。
 */
type ParticipantReactivatedReconstructParams = UnwrapNominalRecord<ParticipantReactivated>;

/**
 * 参加者の復帰イベントのコンストラクターです。
 */
export const ParticipantReactivated = (params: ParticipantReactivated) => {
  // イベント単位でのバリデーションなどがあればここに記述する。
  return params;
};

/**
 * 参加者の復帰イベントのファクトリ関数です。
 *
 * @param params 参加者の復帰イベントの再構築に必要なパラメータです。
 * @returns 値オブジェクトに変換された復帰イベントを返します。
 */
ParticipantReactivated.reconstruct = (
  params: ParticipantReactivatedReconstructParams,
): ParticipantReactivated => {
  return ParticipantReactivated({
    type: ParticipantEventType.REACTIVATED,
    participantId: ParticipantId(params.participantId),
    name: ParticipantName(params.name),
    reactivatedAt: params.reactivatedAt,
  });
};

/**
 * 指定した参加者に対する復帰イベントを作成します。
 *
 * @param participant 対象の参加者です。
 * @returns 新しい復帰イベントを返します。
 */
ParticipantReactivated.create = (participant: Participant): ParticipantReactivated => {
  return ParticipantReactivated({
    type: ParticipantEventType.REACTIVATED,
    participantId: participant.id,
    name: participant.name,
    reactivatedAt: new Date(),
  });
};

/**
 * 参加者の退会イベントの再構築に必要なパラメータです。
 */
type ParticipantWithdrawnReconstructParams = UnwrapNominalRecord<ParticipantWithdrawn>;

/**
 * 参加者の退会イベントのコンストラクターです。
 */
export const ParticipantWithdrawn = (params: ParticipantWithdrawn) => {
  // イベント単位でのバリデーションなどがあればここに記述する。
  return params;
};

/**
 * 参加者の退会イベントのファクトリ関数です。
 *
 * @param params 参加者の退会イベントの再構築に必要なパラメータです。
 * @returns 値オブジェクトに変換された退会イベントを返します。
 */
ParticipantWithdrawn.reconstruct = (
  params: ParticipantWithdrawnReconstructParams,
): ParticipantWithdrawn => {
  return ParticipantWithdrawn({
    type: ParticipantEventType.WITHDRAWN,
    participantId: ParticipantId(params.participantId),
    name: ParticipantName(params.name),
    withdrawnAt: params.withdrawnAt,
  });
};

/**
 * 指定した参加者に対する退会イベントを作成します。
 *
 * @param participant 対象の参加者です。
 * @returns 新しい退会イベントを返します。
 */
ParticipantWithdrawn.create = (participant: Participant): ParticipantWithdrawn => {
  return ParticipantWithdrawn({
    type: ParticipantEventType.WITHDRAWN,
    participantId: participant.id,
    name: participant.name,
    withdrawnAt: new Date(),
  });
};
