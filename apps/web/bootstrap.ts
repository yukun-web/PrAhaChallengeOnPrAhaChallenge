import { initEventBus } from "@ponp/event-bus";
import { createParticipantModule } from "@ponp/participant";

import { createDb } from "./db";

/**
 * Drizzle のデータベースインスタンスです。
 */
const db = createDb();

/**
 * EventBus の認証トークンです。
 */
const authToken = process.env.EVENT_BUS_AUTH_TOKEN;
if (authToken === undefined) {
  throw new Error("EVENT_BUS_AUTH_TOKEN が設定されていません。");
}

/**
 * イベントバスのインスタンスです。
 */
const eventBus = initEventBus({ authToken });

/**
 * 参加者モジュールです。
 */
export const participantModule = createParticipantModule({ db, eventBus });
