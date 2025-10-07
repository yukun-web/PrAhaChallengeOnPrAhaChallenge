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
};

/* ---- コンストラクタ / メソッド ---- */

/**
 * 参加者の識別子のコンストラクタです。
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
 * 参加者の名前のコンストラクタです。
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
 * 参加者のメールアドレスのコンストラクタです。
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
 * 参加者の在籍ステータスのコンストラクタです。
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
 * 参加者のコンストラクタのためのパラメータです。
 */
export type ParticipantParams = {
  id: string;
  name: string;
  email: string;
  status: string;
};

/**
 * 参加者のコンストラクタです。
 *
 * @param props 参加者のコンストラクタのためのパラメータです。
 * @returns 指定されたパラメータの参加者を返します。
 * @throws {ValidationError} 指定されたプロパティのいずれかが不正な場合にスローされます。
 * @remarks この関数をユースケース内で使用しないでください。
 */
export const Participant = (props: ParticipantParams): Participant => {
  return {
    id: ParticipantId(props.id),
    name: ParticipantName(props.name),
    email: ParticipantEmail(props.email),
    status: ParticipantStatus(props.status),
  };
};

/**
 * 参加者の入会に必要なパラメータです。
 */
export type EnrollParticipantParams = Omit<ParticipantParams, "id">;

/**
 * 参加者を入会させます。
 *
 * @params props 参加者の入会に必要なパラメータです。
 * @returns 入会する参加者を返します。
 * @throws {ValidationError} 指定されたパラメータのいずれかが不正な場合にスローされます。
 */
Participant.enroll = (params: EnrollParticipantParams): Participant => {
  return Participant({
    ...params,
    id: ParticipantId.generate(),
  });
};

/**
 * 参加者を休会させます。
 *
 * @params participant 休会させる参加者です。
 * @returns 休会状態の参加者を返します。
 * @throws {DomainError} 指定した参加者が在籍中でない場合にスローされます。
 */
Participant.suspend = (participant: Participant): Participant => {
  const notAllowedError = new DomainError("在籍中の参加者のみ休会できます。", {
    code: "SUSPEND_NOT_ALLOWED_FOR_NON_ACTIVE",
  });
  assert(participant.status === ParticipantStatus.ACTIVE, notAllowedError);

  return Participant({
    ...participant,
    status: ParticipantStatus.SUSPENDED,
  });
};

/**
 * 参加者を復帰させます。
 *
 * @params participant 復帰させる参加者です。
 * @returns 復帰状態の参加者を返します。
 * @throws {DomainError} 指定した参加者が休会中でない場合にスローされます。
 */
Participant.reactivate = (participant: Participant): Participant => {
  const notSuspendedError = new DomainError("休会中の参加者のみ復帰できます。", {
    code: "REACTIVATE_NOT_ALLOWED_FOR_NON_SUSPENDED",
  });
  assert(participant.status === ParticipantStatus.SUSPENDED, notSuspendedError);

  return Participant({
    ...participant,
    status: ParticipantStatus.ACTIVE,
  });
};

/**
 * 参加者を退会させます。
 *
 * @params participant 退会させる参加者です。
 * @returns 退会状態の参加者を返します。
 * @throws {DomainError} 指定した参加者が既に退会済みの場合にスローされます。
 */
Participant.withdraw = (participant: Participant): Participant => {
  const alreadyWithdrawnError = new DomainError("既に退会済みです。", {
    code: "ALREADY_WITHDRAWN",
  });
  assert(participant.status !== ParticipantStatus.WITHDRAWN, alreadyWithdrawnError);

  return Participant({
    ...participant,
    status: ParticipantStatus.WITHDRAWN,
  });
};
