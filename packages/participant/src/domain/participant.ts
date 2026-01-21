import type { UnwrapNominalRecord } from "@ponp/fundamental";
import {
  assert,
  assertEmail,
  assertIncludes,
  assertNonEmptyString,
  assertUUID,
  DomainError,
  type Nominal,
  uuid,
  ValidationError,
} from "@ponp/fundamental";

import {
  ParticipantEnrolled,
  ParticipantReactivated,
  ParticipantSuspended,
  ParticipantWithdrawn,
} from "./events";

/* ---- 型 ---- */

/**
 * 参加者の識別子です。
 */
export type ParticipantId = Nominal<string, "ParticipantId">;

/**
 * 参加者の名前です。
 */
export type ParticipantName = Nominal<string, "ParticipantName">;

/**
 * 参加者のメールアドレスです。
 */
export type ParticipantEmail = Nominal<string, "ParticipantEmail">;

/**
 * 参加者の在籍ステータスです。
 *
 * @remarks
 * - "ACTIVE": 在籍中
 * - "SUSPENDED": 休会中
 * - "WITHDRAWN": 退会済
 */
export type ParticipantStatus = Nominal<"ACTIVE" | "SUSPENDED" | "WITHDRAWN", "ParticipantStatus">;

/**
 * チームの識別子です。
 */
export type TeamId = Nominal<string, "TeamId">;

/**
 * 参加者です。
 */
export type Participant = {
  /**
   * 参加者の識別子です。
   */
  id: ParticipantId;

  /**
   * 参加者の名前です。
   */
  name: ParticipantName;

  /**
   * 参加者のメールアドレスです。
   */
  email: ParticipantEmail;

  /**
   * 参加者の在籍ステータスです。
   */
  status: ParticipantStatus;

  /**
   * 所属チームの識別子です。
   */
  teamId: TeamId;
};

/**
 * 参加者のコンストラクターです。
 */
export const Participant = (params: Participant) => {
  if (!Participant.isActive(params) && TeamId.isAssigned(params.teamId)) {
    throw new DomainError("在籍中でない参加者はチームに所属できません。", {
      code: "NON_ACTIVE_PARTICIPANT_CANNOT_HAVE_TEAM",
    });
  }
  return params;
};

/* ---- ファクトリ関数 / メソッド ---- */

/**
 * 参加者の識別子のファクトリ関数です。
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
 * 参加者の名前のファクトリ関数です。
 *
 * @param value 参加者の名前の文字列です。
 * @returns 指定された文字列が参加者の名前として有効であれば、その文字列を公称型にして返します。
 * @throws {ValidationError} 指定された文字列が参加者の名前の形式と一致しない場合にスローされます。
 */
export const ParticipantName = (value: string): ParticipantName => {
  const emptyError = new ValidationError({
    code: "PARTICIPANT_NAME_EMPTY",
    field: "ParticipantName",
    value,
  });
  assertNonEmptyString(value, emptyError);

  return value as ParticipantName;
};

/**
 * 参加者のメールアドレスのファクトリ関数です。
 *
 * @param value 参加者のメールアドレスの文字列です。
 * @returns 指定された文字列が参加者のメールアドレスとして有効であれば、その文字列を公称型にして返します。
 * @throws {ValidationError} 指定された文字列が参加者のメールアドレスの形式と一致しない場合にスローされます。
 */
export const ParticipantEmail = (value: string): ParticipantEmail => {
  const invalidFormatError = new ValidationError({
    code: "INVALID_PARTICIPANT_EMAIL_FORMAT",
    field: "ParticipantEmail",
    value,
  });
  assertEmail(value, invalidFormatError);

  return value as ParticipantEmail;
};

/**
 * 参加者の在籍ステータスのファクトリ関数です。
 *
 * @param value 参加者の在籍ステータスの文字列です。
 * @returns 指定された文字列が参加者の在籍ステータスとして有効であれば、その文字列を公称型にして返します。
 * @throws {ValidationError} 指定された文字列が参加者の在籍ステータスの形式と一致しない場合にスローされます。
 */
export const ParticipantStatus = (value: string): ParticipantStatus => {
  const invalidFormatError = new ValidationError({
    code: "NON_PARTICIPANT_STATUS",
    field: "ParticipantStatus",
    value,
  });
  assertIncludes(["ACTIVE", "SUSPENDED", "WITHDRAWN"], value, invalidFormatError);

  return value as ParticipantStatus;
};

/**
 * 参加者の在籍中を表す値です。
 */
ParticipantStatus.ACTIVE = ParticipantStatus("ACTIVE");

/**
 * 参加者の一時休会中を表す値です。
 */
ParticipantStatus.SUSPENDED = ParticipantStatus("SUSPENDED");

/**
 * 参加者の退会済みを表す値です。
 */
ParticipantStatus.WITHDRAWN = ParticipantStatus("WITHDRAWN");

/**
 * nil UUID を表す定数です。チーム未所属を表すために使用します。
 */
const NIL_UUID = "00000000-0000-0000-0000-000000000000";

/**
 * チームの識別子のファクトリ関数です。
 *
 * @param value チームの識別子の文字列です。
 * @returns 指定された文字列がチームの識別子として有効であれば、その文字列を公称型にして返します。
 * @throws {ValidationError} 指定された文字列がチームの識別子の形式と一致しない場合にスローされます。
 */
export const TeamId = (value: string): TeamId => {
  // nil UUID はチーム未所属を表す特別な値として許可する
  if (value === NIL_UUID) {
    return value as TeamId;
  }

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
 * チーム未所属を表す特別な値です。
 */
TeamId.NONE = TeamId(NIL_UUID);

/**
 * チーム未所属かどうかを判定します。
 *
 * @param teamId 判定するチームの識別子です。
 * @returns チーム未所属の場合は true を、そうでない場合は false を返します。
 */
TeamId.isNone = (teamId: TeamId): boolean => teamId === TeamId.NONE;

/**
 * チームに所属しているかどうかを判定します。
 *
 * @param teamId 判定するチームの識別子です。
 * @returns チームに所属している場合は true を、そうでない場合は false を返します。
 */
TeamId.isAssigned = (teamId: TeamId): boolean => teamId !== TeamId.NONE;

/**
 * 参加者の再構築に必要なパラメータです。
 */
export type ReconstructParticipantParams = UnwrapNominalRecord<Participant>;

/**
 * 参加者を再構築するための関数です。
 *
 * @param params 参加者の再構築に必要なパラメータです。
 * @returns 指定されたパラメータの参加者を返します。
 * @throws {ValidationError} 指定されたプロパティのいずれかが不正な場合にスローされます。
 * @remarks この関数はリポジトリでのみ使用し、アプリケーション層では用途にあったメソッドを使用してください。
 */
Participant.reconstruct = (params: ReconstructParticipantParams): Participant => {
  return Participant({
    id: ParticipantId(params.id),
    name: ParticipantName(params.name),
    email: ParticipantEmail(params.email),
    status: ParticipantStatus(params.status),
    teamId: TeamId(params.teamId),
  });
};

/**
 * 参加者の入会に必要なパラメータです。
 */
export type EnrollParticipantParams = Omit<Participant, "id" | "status" | "teamId">;

/**
 * 参加者を入会させます。
 *
 * @params props 参加者の入会に必要なパラメータです。
 * @returns 入会する参加者と入会イベントを返します。
 * @throws {ValidationError} 指定されたパラメータのいずれかが不正な場合にスローされます。
 */
Participant.enroll = (params: EnrollParticipantParams): [Participant, ParticipantEnrolled] => {
  const participant = Participant({
    id: ParticipantId.generate(),
    name: params.name,
    email: params.email,
    status: ParticipantStatus.ACTIVE,
    teamId: TeamId.NONE,
  });

  const participantEnrolled = ParticipantEnrolled.create(participant);

  return [participant, participantEnrolled];
};

/**
 * 参加者を休会させます。
 *
 * @params participant 休会させる参加者です。
 * @returns 休会状態の参加者と休会イベントを返します。
 * @throws {DomainError} 指定した参加者が在籍中でない場合にスローされます。
 */
Participant.suspend = (participant: Participant): [Participant, ParticipantSuspended] => {
  const notAllowedError = new DomainError("在籍中の参加者のみ休会できます。", {
    code: "SUSPEND_NOT_ALLOWED_FOR_NON_ACTIVE",
  });
  assert(Participant.isActive(participant), notAllowedError);

  const suspended = Participant({
    ...participant,
    status: ParticipantStatus.SUSPENDED,
    teamId: TeamId.NONE,
  });

  const participantSuspended = ParticipantSuspended.create(suspended);

  return [suspended, participantSuspended];
};

/**
 * 参加者を復帰させます。
 *
 * @params participant 復帰させる参加者です。
 * @returns 復帰状態の参加者と復帰イベントを返します。
 * @throws {DomainError} 指定した参加者が休会中でない場合にスローされます。
 */
Participant.reactivate = (participant: Participant): [Participant, ParticipantReactivated] => {
  const notSuspendedError = new DomainError("休会中の参加者のみ復帰できます。", {
    code: "REACTIVATE_NOT_ALLOWED_FOR_NON_SUSPENDED",
  });
  assert(Participant.isSuspended(participant), notSuspendedError);

  const reactivated = Participant({
    ...participant,
    status: ParticipantStatus.ACTIVE,
  });

  const participantReactivated = ParticipantReactivated.create(reactivated);

  return [reactivated, participantReactivated];
};

/**
 * 参加者を退会させます。
 *
 * @params participant 退会させる参加者です。
 * @returns 退会状態の参加者と退会イベントを返します。
 * @throws {DomainError} 指定した参加者が既に退会済みの場合にスローされます。
 */
Participant.withdraw = (participant: Participant): [Participant, ParticipantWithdrawn] => {
  const alreadyWithdrawnError = new DomainError("既に退会済みです。", {
    code: "ALREADY_WITHDRAWN",
  });
  assert(!Participant.isWithdrawn(participant), alreadyWithdrawnError);

  const withdrawn = Participant({
    ...participant,
    status: ParticipantStatus.WITHDRAWN,
    teamId: TeamId.NONE,
  });

  const participantWithdrawn = ParticipantWithdrawn.create(withdrawn);

  return [withdrawn, participantWithdrawn];
};

/**
 * 参加者が在籍中かどうかを判定します。
 *
 * @param participant 判定する参加者です。
 * @returns 参加者が在籍中の場合は true を、そうでない場合は false を返します。
 */
Participant.isActive = (participant: Participant): boolean => {
  return participant.status === ParticipantStatus.ACTIVE;
};

/**
 * 参加者が休会中かどうかを判定します。
 *
 * @param participant 判定する参加者です。
 * @returns 参加者が休会中の場合は true を、そうでない場合は false を返します。
 */
Participant.isSuspended = (participant: Participant): boolean => {
  return participant.status === ParticipantStatus.SUSPENDED;
};

/**
 * 参加者が退会済みかどうかを判定します。
 *
 * @param participant 判定する参加者です。
 * @returns 参加者が退会済みの場合は true を、そうでない場合は false を返します。
 */
Participant.isWithdrawn = (participant: Participant): boolean => {
  return participant.status === ParticipantStatus.WITHDRAWN;
};
