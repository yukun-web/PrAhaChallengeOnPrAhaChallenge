import { subscribe } from "@ponp/event-bus";
import { ParticipantEnrolledEvent } from "@ponp/integration-events";
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

/**
 * サンプルのイベントリスナーです。
 */
subscribe(eventBus, ParticipantEnrolledEvent, "HANDLE_PARTICIPANT_ENROLLED_ON_SAMPLE", (event) => {
  console.log(event);
});
