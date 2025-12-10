import type { ReconstructParticipantParams } from "../participant";
import { Participant } from "../participant";

/**
 * テスト用のダミー参加者を作成します。
 * パラメータを指定すると、デフォルト値を指定した項目だけ更新します。
 *
 * @param params 参加者のプロパティを上書きしたい部分だけ指定します。
 * @returns デフォルト値に指定値を上書きした、ダミー参加者を返します。
 */
export const createDummyParticipant = (params: Partial<ReconstructParticipantParams> = {}) => {
  return Participant.reconstruct({
    id: "27ededf6-e5c3-4eb2-b0ff-5f67e892e096",
    name: "山田 太郎",
    email: "yamada@example.com",
    status: "ACTIVE",
    ...params,
  });
};
