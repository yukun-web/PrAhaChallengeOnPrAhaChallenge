import type { UnwrapNominalRecord } from "@ponp/fundamental";

import type { Team } from "./team";
import { TeamId, TeamName } from "./team";

/* ---- イベントタイプ定数 ---- */

/**
 * チームドメインイベントのタイプを表す定数です。
 */
export const TeamEventType = {
  CREATED: "TEAM_CREATED",
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
 * チームコンテキストのすべてのドメインイベントのユニオンです。
 */
export type TeamEvent = TeamCreated;

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
