import type { Database } from "@ponp/fundamental";
import { assertRecordExists, createInMemoryDatabase } from "@ponp/testing";
import { beforeAll, describe, test } from "vitest";

import type { SaveParticipant } from "../../application/port/participant.repository";
import { Participant, type Participant as ParticipantType } from "../../domain";
import { participantsTable } from "../db/schema";
import { createSaveParticipant } from "./participant.postgres.repository";

describe("ParticipantPostgresRepository", () => {
  /**
   * beforeAll でテスト用のインメモリデータベースへ接続されたクライアントが代入されます。
   */
  let db: Database;

  beforeAll(async () => {
    db = await createInMemoryDatabase();
  });

  describe("saveParticipant", () => {
    /**
     * beforeAll でテスト対象の参加者保存のための関数が代入されます。
     */
    let saveParticipant: SaveParticipant;

    beforeAll(async () => {
      db = await createInMemoryDatabase();
      saveParticipant = createSaveParticipant({ db });
    });

    test("参加者を保存できる", async () => {
      const participant: ParticipantType = Participant.reconstruct({
        id: "27ededf6-e5c3-4eb2-b0ff-5f67e892e096",
        name: "山田 太郎",
        email: "yamada@example.com",
        status: "ACTIVE",
      });

      await saveParticipant(participant);

      await assertRecordExists(db, participantsTable, participant);
    });

    test("保存した参加者を更新できる", async () => {
      const participant: ParticipantType = Participant.reconstruct({
        id: "27ededf6-e5c3-4eb2-b0ff-5f67e892e096",
        name: "山田 太郎",
        email: "yamada@example.com",
        status: "ACTIVE",
      });

      await saveParticipant(participant);
      await assertRecordExists(db, participantsTable, participant);

      const updatedParticipant = Participant.withdraw(participant);

      await saveParticipant(updatedParticipant);
      await assertRecordExists(db, participantsTable, updatedParticipant);
    });
  });
});
