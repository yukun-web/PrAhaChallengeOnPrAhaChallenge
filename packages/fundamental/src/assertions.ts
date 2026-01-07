import type { ValidationError } from "./errors";

/**
 * 条件が真であることを検証します。条件が偽の場合、指定されたメッセージを持つエラーをスローします。
 *
 * @param condition 検証する条件です。
 * @param error 条件が偽である場合にスローするエラーです。
 */
export function assert(condition: boolean, error: Error): asserts condition {
  if (!condition) {
    throw error;
  }
}

/**
 * UUID の形式を検証するための正規表現です。
 */
const UUID_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

/**
 * 指定された値がUUID形式の文字列かどうかを検証します。
 *
 * @param value 検証する値です。
 * @param error 検証に失敗した場合にスローするエラーです。
 * @throws {ValidationError} 指定した値が正しくない場合は指定された ValidationError をスローします。
 */
export function assertUUID(value: string, error: ValidationError): asserts value is string {
  const isUUID = UUID_REGEX.test(value);
  assert(isUUID, error);
}

/**
 * 指定された文字列が空でないことを検証します。
 *
 * @param value 検証する文字列です。
 * @param error
 * @throws {ValidationError} 指定した文字列が空の場合は指定された ValidationError をスローします。
 *
 * @example
 * assertNonEmptyString("hello", "テスト項目"); // OK
 * assertNonEmptyString("", "テスト項目"); // ValidationError: テスト項目に空の文字列が指定されました。
 */
export function assertNonEmptyString(
  value: string,
  error: ValidationError,
): asserts value is string {
  assert(value.length > 0, error);
}

/**
 * メールアドレスの形式を検証するための正規表現です。
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * 指定された値がメールアドレスの形式かどうかを検証します。
 *
 * @param value 検証する値です。
 * @param error 検証に失敗した場合にスローするエラーです。
 * @throws {ValidationError} 指定した値が正しくない場合は指定された ValidationError をスローします。
 */
export function assertEmail(value: string, error: ValidationError): asserts value is string {
  const isEmail = EMAIL_REGEX.test(value);
  assert(isEmail, error);
}

/**
 * 指定された値が指定された配列に含まれているかどうかを検証します。
 *
 * @param array 検索対象の配列です。
 * @param value 検証する値です。
 * @param error 検証に失敗した場合にスローするエラーです。
 * @throws {ValidationError} 指定した値が配列に含まれていない場合は指定された ValidationError をスローします。
 */
export function assertIncludes<T>(
  array: T[],
  value: unknown,
  error: ValidationError,
): asserts value is T {
  assert(array.includes(value as T), error);
}
