import type { Database } from "@ponp/fundamental";
import { assertRecordExists, createInMemoryDatabase } from "@ponp/testing";
import { beforeAll, describe, expect, test } from "vitest";

import type { ParticipantRepository } from "../../application/port/participant.repository";
import { Participant, ParticipantId } from "../../domain";
import { createDummyParticipant } from "../../domain/testing";
import { participantsTable } from "../db/schema";
import { ParticipantDrizzleRepository } from "./participant.drizzle.repository";

describe("参加者リポジトリ（Drizzle）", () => {
  /**
   * beforeAll でテスト用のインメモリデータベースへ接続されたクライアントが代入されます。
   */
  let db: Database;

  /**
   * beforeAll で参加者リポジトリが代入されます。
   */
  let repository: ParticipantRepository;

  beforeAll(async () => {
    db = await createInMemoryDatabase();
    repository = ParticipantDrizzleRepository({ db });
  });

  describe("保存", () => {
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

  describe("ID 取得", () => {
    test("保存済みの参加者を取得できる", async () => {
      const participant = createDummyParticipant({ id: ParticipantId.generate() });
      await repository.save(participant);

      const result = await repository.findById(participant.id);

      expect(result).toEqual(participant);
    });

    test("存在しない参加者の場合は undefined を返す", async () => {
      const result = await repository.findById(ParticipantId.generate());

      expect(result).toBeUndefined();
    });
  });
});
