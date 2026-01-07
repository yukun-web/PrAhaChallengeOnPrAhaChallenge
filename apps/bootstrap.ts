import { createDb } from "./web/db";
import { createParticipantModule } from "../packages/participant";

/**
 * Drizzle のデータベースインスタンスです。
 */
const db = createDb();

/**
 * 参加者モジュールです。
 */
export const participantModule = createParticipantModule({ db });
