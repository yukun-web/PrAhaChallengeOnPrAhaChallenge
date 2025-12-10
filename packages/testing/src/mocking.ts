import { vi } from "vitest";
import * as Fundamental from "@ponp/fundamental";

/**
 * Fundamental.uuid 関数をスパイし、指定した値を返すようにします。
 * 繰り返し呼び出すと、その回数分だけ指定した値を返します。
 *
 * @param value スパイが返す値を指定します。
 * @returns スパイオブジェクトを返します。
 */
export const spyUuid = (() => {
  let spy: ReturnType<typeof vi.spyOn>;

  return (value: string) => {
    if (!spy) {
      spy = vi.spyOn(Fundamental, "uuid");
    }

    spy.mockReturnValueOnce(value);

    return spy;
  };
})();
