import { createParticipantModule } from "@ponp/participant";

import { createDb } from "./db";
import { createEventBus } from "./event-bus";

/**
 * Drizzle のデータベースインスタンスです。
 */
const db = createDb();

/**
 * イベントバスのインスタンスです。
 */
export const eventBus = createEventBus();

/**
 * 参加者モジュールです。
 */
export const participantModule = createParticipantModule({ db, eventBus });

