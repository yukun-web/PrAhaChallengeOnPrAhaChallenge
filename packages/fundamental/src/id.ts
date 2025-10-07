import { v4 } from "uuid";

/**
 * ランダムな UUID を生成します。
 *
 * @returns ランダムな UUID を返します。
 * @remarks UUID を新しく生成するときは必ずこの関数を使用してください。
 */
export function uuid() {
  return v4();
}
