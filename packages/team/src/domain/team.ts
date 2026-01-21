import type { UnwrapNominalRecord } from "@ponp/fundamental";
import {
  assert,
  assertNonEmptyString,
  assertRegex,
  assertStringLength,
  assertUUID,
  DomainError,
  type Nominal,
  uuid,
  ValidationError,
} from "@ponp/fundamental";

import {
  ParticipantJoinedTeam,
  ParticipantLeftTeam,
  TeamCreated,
} from "./events";

/**
 * 小文字英字のみを許可する正規表現です。
 */
const LOWERCASE_ALPHABETIC_REGEX = /^[a-z]+$/;

/* ---- 型 ---- */

/**
 * チームコンテキストにおける参加者の識別子です。
 */
export type ParticipantId = Nominal<string, "ParticipantId">;

/**
 * チームの識別子です。
 */
export type TeamId = Nominal<string, "TeamId">;

/**
 * チームの名前です。
 */
export type TeamName = Nominal<string, "TeamName">;

/**
 * チームです。
 */
export type Team = {
  /**
   * チームの識別子です。
   */
  id: TeamId;

  /**
   * チームの名前です。
   */
  name: TeamName;

  /**
   * チームに所属する参加者の識別子リストです。
   */
  participantIds: ParticipantId[];
};

/**
 * チームのコンストラクターです。
 */
export const Team = (params: Team) => {
  // エンティティ単位でのバリデーションなどがあればここに記述する。
  return params;
};

/* ---- ファクトリ関数 ---- */

/**
 * チームの識別子のファクトリ関数です。
 *
 * @param value チームの識別子の文字列です。
 * @returns 指定された文字列がチームの識別子として有効であれば、その文字列を公称型にして返します。
 * @throws {ValidationError} 指定された文字列がチームの識別子の形式と一致しない場合にスローされます。
 */
export const TeamId = (value: string): TeamId => {
  const invalidFormatError = new ValidationError({
    code: "INVALID_TEAM_ID_FORMAT",
    field: "TeamId",
    value,
  });
  assertUUID(value, invalidFormatError);

  return value as TeamId;
};

/**
 * 新しいチームの識別子をランダムな UUID から生成します。
 *
 * @returns 新しいチームの識別子を返します。
 */
TeamId.generate = () => {
  return TeamId(uuid());
};

/**
 * チームコンテキストにおける参加者の識別子のファクトリ関数です。
 *
 * @param value 参加者の識別子の文字列です。
 * @returns 指定された文字列が参加者の識別子として有効であれば、その文字列を公称型にして返します。
 * @throws {ValidationError} 指定された文字列が参加者の識別子の形式と一致しない場合にスローされます。
 */
export const ParticipantId = (value: string): ParticipantId => {
  const invalidFormatError = new ValidationError({
    code: "INVALID_PARTICIPANT_ID_FORMAT",
    field: "ParticipantId",
    value,
  });
  assertUUID(value, invalidFormatError);

  return value as ParticipantId;
};

/**
 * 新しい参加者の識別子をランダムな UUID から生成します。
 *
 * @returns 新しい参加者の識別子を返します。
 */
ParticipantId.generate = () => {
  return ParticipantId(uuid());
};

/**
 * チームの名前のファクトリ関数です。
 *
 * @param value チームの名前の文字列です。
 * @returns 指定された文字列がチームの名前として有効であれば、その文字列を公称型にして返します。
 * @throws {ValidationError} 指定された文字列が空の場合にスローされます。
 * @throws {ValidationError} 指定された文字列が1文字を超える場合にスローされます。
 * @throws {ValidationError} 指定された文字列が小文字英字以外を含む場合にスローされます。
 */
export const TeamName = (value: string): TeamName => {
  const emptyError = new ValidationError({
    code: "TEAM_NAME_EMPTY",
    field: "TeamName",
    value,
  });
  assertNonEmptyString(value, emptyError);

  const tooLongError = new ValidationError({
    code: "TEAM_NAME_TOO_LONG",
    field: "TeamName",
    value,
  });
  assertStringLength(value, 1, tooLongError);

  const notLowercaseAlphabeticError = new ValidationError({
    code: "TEAM_NAME_NOT_LOWERCASE_ALPHABETIC",
    field: "TeamName",
    value,
  });
  assertRegex(value, LOWERCASE_ALPHABETIC_REGEX, notLowercaseAlphabeticError);

  return value as TeamName;
};

/* ---- エンティティメソッド ---- */

/**
 * チームの再構築に必要なパラメータです。
 */
export type ReconstructTeamParams = UnwrapNominalRecord<Team>;

/**
 * チームを再構築するための関数です。
 *
 * @param params チームの再構築に必要なパラメータです。
 * @returns 指定されたパラメータのチームを返します。
 * @throws {ValidationError} 指定されたプロパティのいずれかが不正な場合にスローされます。
 * @remarks この関数はリポジトリでのみ使用し、アプリケーション層では用途にあったメソッドを使用してください。
 */
Team.reconstruct = (params: ReconstructTeamParams): Team => {
  return Team({
    id: TeamId(params.id),
    name: TeamName(params.name),
    participantIds: params.participantIds.map((id) => ParticipantId(id)),
  });
};

/**
 * チームの作成に必要なパラメータです。
 */
export type CreateTeamParams = Omit<Team, "id">;

/**
 * チームを作成します。
 *
 * @param params チームの作成に必要なパラメータです。
 * @returns 作成されたチームと作成イベントを返します。
 * @throws {ValidationError} 指定されたパラメータのいずれかが不正な場合にスローされます。
 */
Team.create = (params: CreateTeamParams): [Team, TeamCreated] => {
  const team = Team({
    id: TeamId.generate(),
    name: params.name,
    participantIds: [],
  });

  const teamCreated = TeamCreated.create(team);

  return [team, teamCreated];
};

/**
 * 参加者をチームに参加させます。
 *
 * @param team 対象のチームです。
 * @param participantId 参加させる参加者の識別子です。
 * @returns 参加者が追加されたチームと参加イベントを返します。
 * @throws {DomainError} 参加者が既にチームに所属している場合にスローされます。
 */
Team.join = (team: Team, participantId: ParticipantId): [Team, ParticipantJoinedTeam] => {
  const alreadyJoinedError = new DomainError("この参加者は既にチームに所属しています。", {
    code: "PARTICIPANT_ALREADY_IN_TEAM",
  });
  assert(!team.participantIds.includes(participantId), alreadyJoinedError);

  const updatedTeam = Team({
    ...team,
    participantIds: [...team.participantIds, participantId],
  });

  const participantJoinedTeam = ParticipantJoinedTeam.create(updatedTeam, participantId);

  return [updatedTeam, participantJoinedTeam];
};

/**
 * 参加者をチームから離脱させます。
 *
 * @param team 対象のチームです。
 * @param participantId 離脱させる参加者の識別子です。
 * @returns 参加者が削除されたチームと離脱イベントを返します。
 * @throws {DomainError} 参加者がチームに所属していない場合にスローされます。
 */
Team.leave = (team: Team, participantId: ParticipantId): [Team, ParticipantLeftTeam] => {
  const notInTeamError = new DomainError("この参加者はチームに所属していません。", {
    code: "PARTICIPANT_NOT_IN_TEAM",
  });
  assert(team.participantIds.includes(participantId), notInTeamError);

  const updatedTeam = Team({
    ...team,
    participantIds: team.participantIds.filter((id) => id !== participantId),
  });

  const participantLeftTeam = ParticipantLeftTeam.create(updatedTeam, participantId);

  return [updatedTeam, participantLeftTeam];
};
