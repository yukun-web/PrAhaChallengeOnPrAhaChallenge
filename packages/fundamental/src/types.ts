/**
 * 公称型を作成するヘルパー型です。
 *
 * @template T 公称型にする型です。
 * @template Name 公称型の名前です。
 * @example
 * type UserId = Nominal<string, 'UserId'>;
 */
export type Nominal<T, Name extends string> = T & { [Symbol.species]: Name; __primitive: T };
