/**
 * 公称型を作成するヘルパー型です。
 *
 * @template T 公称型にする型です。
 * @template Name 公称型の名前です。
 * @example
 * type UserId = Nominal<string, 'UserId'>;
 */
export type Nominal<T, Name extends string> = T & { [Symbol.species]: Name; __primitive: T };

/**
 * 公称型からプリミティブ型を取得するヘルパー型です。
 *
 * @template T 公称型です。
 * @example
 * type RawUserId = UnwrapNominal<UserId>; // string
 */
export type UnwrapNominal<T> = T extends { __primitive: infer P } ? P : T;

/**
 * レコード内にある交渉型の値をプリミティブ型に変換するヘルパー型です。
 *
 * @template T 変換対象のレコード型です。
 * @example
 * type User = {
 *   id: Nominal<string, 'UserId'>;
 *   name: string;
 * };
 * type RawUser = UnwrapNominalRecord<User>; // { id: string; name: string; }
 */
export type UnwrapNominalRecord<R extends Record<string, unknown>> = {
  [K in keyof R]: R[K] extends Record<string, unknown>
    ? UnwrapNominalRecord<R[K]>
    : UnwrapNominal<R[K]>;
};
