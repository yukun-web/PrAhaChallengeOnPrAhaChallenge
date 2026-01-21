import type { UnwrapNominalRecord } from "@ponp/fundamental";

import type { Team } from "./team";
import { ParticipantId, TeamId, TeamName } from "./team";

/* ---- イベントタイプ定数 ---- */

/**
 * チームドメインイベントのタイプを表す定数です。
 */
export const TeamEventType = {
  CREATED: "TEAM_CREATED",
  PARTICIPANT_JOINED: "PARTICIPANT_JOINED_TEAM",
  PARTICIPANT_LEFT: "PARTICIPANT_LEFT_TEAM",
} as const;

/* ---- 型 ---- */

/**
 * 新しいチームが作成されたことを表すイベントです。
 */
export type TeamCreated = {
  /**
   * イベントのタイプです。
   */
  type: typeof TeamEventType.CREATED;

  /**
   * 作成されたチームの識別子です。
   * @see TeamId
   */
  teamId: TeamId;

  /**
   * 作成されたチームの名前です。
   * @see TeamName
   */
  name: TeamName;

  /**
   * 作成された日時です。
   */
  createdAt: Date;
};

/**
 * 参加者がチームに参加したことを表すイベントです。
 */
export type ParticipantJoinedTeam = {
  /**
   * イベントのタイプです。
   */
  type: typeof TeamEventType.PARTICIPANT_JOINED;

  /**
   * 参加先のチームの識別子です。
   * @see TeamId
   */
  teamId: TeamId;

  /**
   * 参加した参加者の識別子です。
   * @see ParticipantId
   */
  participantId: ParticipantId;

  /**
   * 参加した日時です。
   */
  joinedAt: Date;
};

/**
 * 参加者がチームから離脱したことを表すイベントです。
 */
export type ParticipantLeftTeam = {
  /**
   * イベントのタイプです。
   */
  type: typeof TeamEventType.PARTICIPANT_LEFT;

  /**
   * 離脱元のチームの識別子です。
   * @see TeamId
   */
  teamId: TeamId;

  /**
   * 離脱した参加者の識別子です。
   * @see ParticipantId
   */
  participantId: ParticipantId;

  /**
   * 離脱した日時です。
   */
  leftAt: Date;
};

/**
 * チームコンテキストのすべてのドメインイベントのユニオンです。
 */
export type TeamEvent = TeamCreated | ParticipantJoinedTeam | ParticipantLeftTeam;

/* ---- ファクトリ関数 ---- */

/**
 * チームの作成イベントの再構築に必要なパラメータです。
 */
type TeamCreatedReconstructParams = UnwrapNominalRecord<TeamCreated>;

/**
 * チーム作成イベントのコンストラクタです。
 *
 * @param params チーム作成イベントのパラメータです。
 * @returns チーム作成イベントのインスタンスを返します。
 */
export const TeamCreated = (params: TeamCreated) => {
  // イベント単位でのバリデーションなどがあればここに記述する。
  return params;
};

/**
 * チームの作成イベントのファクトリ関数です。
 *
 * @param params チームの作成イベントの再構築に必要なパラメータです。
 * @returns 値オブジェクトに変換された作成イベントを返します。
 */
TeamCreated.reconstruct = (params: TeamCreatedReconstructParams): TeamCreated => {
  return TeamCreated({
    type: TeamEventType.CREATED,
    teamId: TeamId(params.teamId),
    name: TeamName(params.name),
    createdAt: params.createdAt,
  });
};

/**
 * 指定したチームに対する作成イベントを作成します。
 *
 * @param team 対象のチームです。
 * @returns 新しい作成イベントを返します。
 */
TeamCreated.create = (team: Team): TeamCreated => {
  return TeamCreated({
    type: TeamEventType.CREATED,
    teamId: team.id,
    name: team.name,
    createdAt: new Date(),
  });
};

/* ---- ParticipantJoinedTeam ファクトリ関数 ---- */

/**
 * 参加者がチームに参加したイベントの再構築に必要なパラメータです。
 */
type ParticipantJoinedTeamReconstructParams = UnwrapNominalRecord<ParticipantJoinedTeam>;

/**
 * 参加者がチームに参加したイベントのコンストラクタです。
 *
 * @param params 参加者がチームに参加したイベントのパラメータです。
 * @returns 参加者がチームに参加したイベントのインスタンスを返します。
 */
export const ParticipantJoinedTeam = (params: ParticipantJoinedTeam) => {
  // イベント単位でのバリデーションなどがあればここに記述する。
  return params;
};

/**
 * 参加者がチームに参加したイベントのファクトリ関数です。
 *
 * @param params 参加者がチームに参加したイベントの再構築に必要なパラメータです。
 * @returns 値オブジェクトに変換された参加イベントを返します。
 */
ParticipantJoinedTeam.reconstruct = (
  params: ParticipantJoinedTeamReconstructParams,
): ParticipantJoinedTeam => {
  return ParticipantJoinedTeam({
    type: TeamEventType.PARTICIPANT_JOINED,
    teamId: TeamId(params.teamId),
    participantId: ParticipantId(params.participantId),
    joinedAt: params.joinedAt,
  });
};

/**
 * 指定したチームと参加者に対する参加イベントを作成します。
 *
 * @param team 対象のチームです。
 * @param participantId 参加した参加者の識別子です。
 * @returns 新しい参加イベントを返します。
 */
ParticipantJoinedTeam.create = (team: Team, participantId: ParticipantId): ParticipantJoinedTeam => {
  return ParticipantJoinedTeam({
    type: TeamEventType.PARTICIPANT_JOINED,
    teamId: team.id,
    participantId,
    joinedAt: new Date(),
  });
};

/* ---- ParticipantLeftTeam ファクトリ関数 ---- */

/**
 * 参加者がチームから離脱したイベントの再構築に必要なパラメータです。
 */
type ParticipantLeftTeamReconstructParams = UnwrapNominalRecord<ParticipantLeftTeam>;

/**
 * 参加者がチームから離脱したイベントのコンストラクタです。
 *
 * @param params 参加者がチームから離脱したイベントのパラメータです。
 * @returns 参加者がチームから離脱したイベントのインスタンスを返します。
 */
export const ParticipantLeftTeam = (params: ParticipantLeftTeam) => {
  // イベント単位でのバリデーションなどがあればここに記述する。
  return params;
};

/**
 * 参加者がチームから離脱したイベントのファクトリ関数です。
 *
 * @param params 参加者がチームから離脱したイベントの再構築に必要なパラメータです。
 * @returns 値オブジェクトに変換された離脱イベントを返します。
 */
ParticipantLeftTeam.reconstruct = (
  params: ParticipantLeftTeamReconstructParams,
): ParticipantLeftTeam => {
  return ParticipantLeftTeam({
    type: TeamEventType.PARTICIPANT_LEFT,
    teamId: TeamId(params.teamId),
    participantId: ParticipantId(params.participantId),
    leftAt: params.leftAt,
  });
};

/**
 * 指定したチームと参加者に対する離脱イベントを作成します。
 *
 * @param team 対象のチームです。
 * @param participantId 離脱した参加者の識別子です。
 * @returns 新しい離脱イベントを返します。
 */
ParticipantLeftTeam.create = (team: Team, participantId: ParticipantId): ParticipantLeftTeam => {
  return ParticipantLeftTeam({
    type: TeamEventType.PARTICIPANT_LEFT,
    teamId: team.id,
    participantId,
    leftAt: new Date(),
  });
};
