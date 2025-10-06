/**
 * ドメインエラーのオプションです。
 */
type DomainErrorOptions = ErrorOptions & {
  /**
   * エラーコードです。
   */
  code: string;
};

/**
 * ドメイン知識に反する状態が発生したことを表すエラーです。
 */
export class DomainError extends Error {
  /**
   * エラーコードです。
   */
  public code: string;

  static {
    this.prototype.name = "DomainError";
  }

  constructor(message: string, options: DomainErrorOptions) {
    const { code, ...rest } = options;

    super(message, rest);

    this.code = code;
  }
}

/**
 * バリデーションエラーのオプションです。
 */
type ValidationErrorOptions = DomainErrorOptions & {
  /**
   * 対象になるフィールド名です。
   */
  field: string;

  /**
   * バリデーション対象の値です。
   */
  value: unknown;
};

/**
 * バリデーションに失敗したことを表すエラーです。
 */
export class ValidationError extends DomainError {
  /**
   * 対象になるフィールド名です。
   */
  public field: string;

  /**
   * バリデーション対象の値です。
   */
  public value: unknown;

  static {
    this.prototype.name = "DomainValidationError";
  }

  /**
   * ValidationError を初期化します。
   *
   * @param options バリデーションエラーのオプションです。
   */
  constructor(options: ValidationErrorOptions) {
    const { field, value, ...rest } = options;

    super(`${options.code}: バリデーションに失敗しました。`, rest);

    this.field = field;
    this.value = value;
  }
}
