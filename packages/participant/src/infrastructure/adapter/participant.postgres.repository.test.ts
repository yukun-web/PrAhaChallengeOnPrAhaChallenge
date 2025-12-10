import type { Database } from "@ponp/fundamental";
import { assertRecordExists, createInMemoryDatabase } from "@ponp/testing";
import { beforeAll, describe, test } from "vitest";

import type { ParticipantRepository } from "../../application/port/participant.repository";
import { Participant } from "../../domain";
import { createDummyParticipant } from "../../domain/testing";
import { participantsTable } from "../db/schema";
import { ParticipantDrizzleRepository } from "./participant.drizzle.repository";

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
    let repository: ParticipantRepository;

    beforeAll(async () => {
      db = await createInMemoryDatabase();
      repository = ParticipantDrizzleRepository({ db });
    });

    test("参加者を保存できる", async () => {
      const participant = createDummyParticipant();

      await repository.save(participant);

      await assertRecordExists(db, participantsTable, participant);
    });

    test("保存した参加者を更新できる", async () => {
      const participant = createDummyParticipant();

      await repository.save(participant);
      await assertRecordExists(db, participantsTable, participant);

      const [updatedParticipant] = Participant.withdraw(participant);

      await repository.save(updatedParticipant);
      await assertRecordExists(db, participantsTable, updatedParticipant);
    });
  });
});
