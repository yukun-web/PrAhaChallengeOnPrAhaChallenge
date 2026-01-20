import {
  assert,
  assertNonEmptyString,
  assertUUID,
  type Nominal,
  uuid,
  ValidationError,
} from "@ponp/fundamental";

/* ---- 型 ---- */

/**
 * チームの識別子です。
 */
export type TeamId = Nominal<string, "TeamId">;

/**
 * チームの名前です。
 */
export type TeamName = Nominal<string, "TeamName">;

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
 * チームの名前のファクトリ関数です。
 *
 * @param value チームの名前の文字列です。
 * @returns 指定された文字列がチームの名前として有効であれば、その文字列を公称型にして返します。
 * @throws {ValidationError} 指定された文字列が空の場合にスローされます。
 * @throws {ValidationError} 指定された文字列が1文字を超える場合にスローされます。
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
  assert(value.length <= 1, tooLongError);

  return value as TeamName;
};
