import type { ReconstructTaskParams } from "../task";
import { Task } from "../task";

/**
 * テスト用のダミー課題を作成します。
 * パラメータを指定すると、デフォルト値を指定した項目だけ更新します。
 *
 * @param params 課題のプロパティを上書きしたい部分だけ指定します。
 * @returns デフォルト値に指定値を上書きした、ダミー課題を返します。
 */
export const createDummyTask = (params: Partial<ReconstructTaskParams> = {}) => {
  return Task.reconstruct({
    id: "87292b7f-ca43-4a41-b00f-7b73869d7026",
    assigneeId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    status: "NOT_STARTED",
    ...params,
  });
};
