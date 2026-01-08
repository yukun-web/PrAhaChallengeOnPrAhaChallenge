import type { EventBus } from "@ponp/event-bus";
import { initEventBus } from "@ponp/event-bus";

/**
 * EventBus の認証トークンです。
 */
const authToken = process.env.EVENT_BUS_AUTH_TOKEN;
if (authToken === undefined) {
  throw new Error("EVENT_BUS_AUTH_TOKEN が設定されていません。");
}

/**
 * EventBus のインスタンスを作成します。
 *
 * @returns EventBus のインスタンスを返します。
 */
export const createEventBus = (): EventBus => {
  return initEventBus({ authToken });
};
