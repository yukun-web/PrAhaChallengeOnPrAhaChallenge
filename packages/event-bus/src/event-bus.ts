import { TZDate } from "@date-fns/tz";
import { Client } from "@upstash/qstash";

import type { Event, EventConstructor } from "./create-event-constructor";
import type { EventHandler, HandlerRegistry } from "./handler-registry";
import { getQueueName } from "./handler-registry";
import { createHandlerRegistry, getHandlerNames, registerHandler } from "./handler-registry";

/**
 * イベントバスの初期化オプションです。
 */
export type EventBusOptions = {
  /**
   * イベントバスの認証トークンです。
   */
  authToken: string;
};

/**
 * イベントバスの型定義です。
 */
export type EventBus = {
  /**
   * イベントハンドラの登録情報です。
   */
  handlerRegistry: HandlerRegistry;
  /**
   * イベントバスの認証トークンです。
   */
  authToken: string;
  /**
   * QStash クライアントです。
   */
  qstash: Client;
};

declare global {
  var __scs_qstash: Client;
}

/**
 * イベントバスを初期化します。
 * HandlerRegistryを初期化し、それを保持したオブジェクトを返します。
 *
 * @param options イベントバスの初期化オプションを指定します。
 * @returns 初期化されたイベントバスを返します。
 */
export const initEventBus = (options: EventBusOptions): EventBus => {
  const qstash =
    global.__scs_qstash ??
    new Client({
      token: process.env.QSTASH_TOKEN,
    });
  global.__scs_qstash = qstash;

  return {
    handlerRegistry: createHandlerRegistry(),
    authToken: options.authToken,
    qstash,
  };
};

/**
 * イベントを購読します。
 * イベントコンストラクタとハンドラ名を指定してハンドラを登録します。
 *
 * @param eventBus イベントバスを指定します。
 * @param eventConstructor イベントコンストラクタを指定します。
 * @param handlerName ハンドラ名を指定します。
 * @param handler イベントハンドラを指定します。
 * @param queueName イベントキューの名前を指定します。
 * @returns 何も返しません。
 */
export const subscribe = <Type extends string, Payload>(
  eventBus: EventBus,
  eventConstructor: EventConstructor<Event<Type, Payload>>,
  handlerName: string,
  handler: EventHandler<Event<Type, Payload>>,
  queueName?: string,
): void => {
  registerHandler(eventBus.handlerRegistry, eventConstructor, handlerName, handler, queueName);
};

/**
 * イベントを発行します。
 * 登録されているハンドラに対してAPIリクエストを行います。
 *
 * @param eventBus イベントバスを指定します。
 * @param event イベントを指定します。
 * @returns 何も返しません。
 */
export const publish = async <Type extends string, Payload>(
  eventBus: EventBus,
  event: Event<Type, Payload>,
): Promise<void> => {
  const eventType = event.type;
  const EventConstructor = { type: eventType } as unknown as EventConstructor<Event<Type, Payload>>;
  const handlerNames = getHandlerNames(eventBus.handlerRegistry, EventConstructor);

  if (handlerNames.length === 0) {
    return;
  }

  const handlePromises = handlerNames.map(async (handlerName) => {
    let urlString = `${process.env.NEXT_PUBLIC_BASE_URL}/api/event-bus`;
    urlString += `?event=${encodeURIComponent(event.type)}`;
    urlString += `&handler=${encodeURIComponent(handlerName)}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (eventBus.authToken) {
      headers["Authorization"] = `Bearer ${eventBus.authToken}`;
    }

    const queueName = getQueueName(eventBus.handlerRegistry, EventConstructor, handlerName);
    const queue = eventBus.qstash.queue({ queueName });

    try {
      await queue.enqueueJSON({
        url: urlString,
        method: "POST",
        headers,
        body: event,
      });
    } catch (e) {
      console.error(`[Error] ${TZDate.tz("Asia/Tokyo").toISOString()} ${urlString}`, e);
    }
  });

  await Promise.all(handlePromises);
};
