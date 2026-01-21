import type { ReconstructTeamParams } from "../team";
import { Team } from "../team";

/**
 * テスト用のダミーチームを作成します。
 * パラメータを指定すると、デフォルト値を指定した項目だけ更新します。
 *
 * @param params チームのプロパティを上書きしたい部分だけ指定します。
 * @returns デフォルト値に指定値を上書きした、ダミーチームを返します。
 */
export const createDummyTeam = (params: Partial<ReconstructTeamParams> = {}) => {
  return Team.reconstruct({
    id: "27ededf6-e5c3-4eb2-b0ff-5f67e892e096",
    name: "a",
    participantIds: [],
    ...params,
  });
};
