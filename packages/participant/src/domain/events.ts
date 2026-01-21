import type { UnwrapNominalRecord } from "@ponp/fundamental";

import type { Participant } from "./participant";
import { ParticipantId, ParticipantName, TeamId } from "./participant";

/* ---- イベントタイプ定数 ---- */

/**
 * 参加者ドメインイベントのタイプを表す定数です。
 */
export const ParticipantEventType = {
  ENROLLED: "PARTICIPANT_ENROLLED",
  SUSPENDED: "PARTICIPANT_SUSPENDED",
  REACTIVATED: "PARTICIPANT_REACTIVATED",
  WITHDRAWN: "PARTICIPANT_WITHDRAWN",
  TEAM_ASSIGNED: "PARTICIPANT_TEAM_ASSIGNED",
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
   * 休会前に所属していたチームの識別子です。
   * @see TeamId
   */
  previousTeamId: TeamId;

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
   * 退会前に所属していたチームの識別子です。
   * @see TeamId
   */
  previousTeamId: TeamId;

  /**
   * 退会した日時です。
   */
  withdrawnAt: Date;
};

/**
 * 参加者がチームに割り当てられたことを表すイベントです。
 */
export type ParticipantTeamAssigned = {
  /**
   * イベントのタイプです。
   */
  type: typeof ParticipantEventType.TEAM_ASSIGNED;

  /**
   * チームに割り当てられた参加者の識別子です。
   * @see ParticipantId
   */
  participantId: ParticipantId;

  /**
   * チームに割り当てられた参加者の名前です。
   * @see ParticipantName
   */
  name: ParticipantName;

  /**
   * 割り当てられたチームの識別子です。
   * @see TeamId
   */
  teamId: TeamId;

  /**
   * チームに割り当てられた日時です。
   */
  assignedAt: Date;
};

/**
 * 参加者コンテキストのすべてのドメインイベントのユニオンです。
 */
export type ParticipantEvent =
  | ParticipantEnrolled
  | ParticipantSuspended
  | ParticipantReactivated
  | ParticipantWithdrawn
  | ParticipantTeamAssigned;

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
    previousTeamId: TeamId(params.previousTeamId),
    suspendedAt: params.suspendedAt,
  });
};

/**
 * 休会イベント作成のパラメータです。
 */
type CreateParticipantSuspendedParams = {
  /**
   * 対象の参加者です。
   */
  participant: Participant;

  /**
   * 休会前に所属していたチームの識別子です。
   */
  previousTeamId: TeamId;
};

/**
 * 指定した参加者に対する休会イベントを作成します。
 *
 * @param params 休会イベント作成のパラメータです。
 * @returns 新しい休会イベントを返します。
 */
ParticipantSuspended.create = (params: CreateParticipantSuspendedParams): ParticipantSuspended => {
  return ParticipantSuspended({
    type: ParticipantEventType.SUSPENDED,
    participantId: params.participant.id,
    name: params.participant.name,
    previousTeamId: params.previousTeamId,
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
    previousTeamId: TeamId(params.previousTeamId),
    withdrawnAt: params.withdrawnAt,
  });
};

/**
 * 退会イベント作成のパラメータです。
 */
type CreateParticipantWithdrawnParams = {
  /**
   * 対象の参加者です。
   */
  participant: Participant;

  /**
   * 退会前に所属していたチームの識別子です。
   */
  previousTeamId: TeamId;
};

/**
 * 指定した参加者に対する退会イベントを作成します。
 *
 * @param params 退会イベント作成のパラメータです。
 * @returns 新しい退会イベントを返します。
 */
ParticipantWithdrawn.create = (params: CreateParticipantWithdrawnParams): ParticipantWithdrawn => {
  return ParticipantWithdrawn({
    type: ParticipantEventType.WITHDRAWN,
    participantId: params.participant.id,
    name: params.participant.name,
    previousTeamId: params.previousTeamId,
    withdrawnAt: new Date(),
  });
};

/**
 * 参加者のチーム割り当てイベントの再構築に必要なパラメータです。
 */
type ParticipantTeamAssignedReconstructParams = UnwrapNominalRecord<ParticipantTeamAssigned>;

/**
 * 参加者のチーム割り当てイベントのコンストラクターです。
 */
export const ParticipantTeamAssigned = (params: ParticipantTeamAssigned) => {
  // イベント単位でのバリデーションなどがあればここに記述する。
  return params;
};

/**
 * 参加者のチーム割り当てイベントのファクトリ関数です。
 *
 * @param params 参加者のチーム割り当てイベントの再構築に必要なパラメータです。
 * @returns 値オブジェクトに変換されたチーム割り当てイベントを返します。
 */
ParticipantTeamAssigned.reconstruct = (
  params: ParticipantTeamAssignedReconstructParams,
): ParticipantTeamAssigned => {
  return ParticipantTeamAssigned({
    type: ParticipantEventType.TEAM_ASSIGNED,
    participantId: ParticipantId(params.participantId),
    name: ParticipantName(params.name),
    teamId: TeamId(params.teamId),
    assignedAt: params.assignedAt,
  });
};

/**
 * 指定した参加者に対するチーム割り当てイベントを作成します。
 *
 * @param participant 対象の参加者です。
 * @returns 新しいチーム割り当てイベントを返します。
 */
ParticipantTeamAssigned.create = (participant: Participant): ParticipantTeamAssigned => {
  return ParticipantTeamAssigned({
    type: ParticipantEventType.TEAM_ASSIGNED,
    participantId: participant.id,
    name: participant.name,
    teamId: participant.teamId,
    assignedAt: new Date(),
  });
};
