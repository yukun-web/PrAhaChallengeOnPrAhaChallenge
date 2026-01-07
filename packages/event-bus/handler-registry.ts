import type { Event, EventConstructor } from "./create-event-constructor";

/**
 * イベントハンドラの型定義
 */
export type EventHandler<E extends Event = Event> = (event: E) => unknown;

/**
 * イベントハンドラのエントリーの型定義
 */
export type EventHandlerEntry = {
  eventConstructor: EventConstructor;
  handlerName: string;
  handler: EventHandler;
  queueName: string;
};

/**
 * ハンドラレジストリの型定義
 */
export type HandlerRegistry = EventHandlerEntry[];

/**
 * 空のハンドラレジストリを作成します。
 *
 * @returns 空のハンドラレジストリ
 */
export const createHandlerRegistry = (): EventHandlerEntry[] => {
  return [];
};

/**
 * イベントコンストラクタとハンドラ名を指定してハンドラを登録します。
 *
 * @param registry ハンドラレジストリ
 * @param eventConstructor イベントコンストラクタ
 * @param handlerName ハンドラ名
 * @param handler イベントハンドラ
 * @param queueName イベントを受け取るキューの名前（指定しない場合はイベント名とハンドラ名から自動生成されます）
 */
export const registerHandler = <Type extends string, Payload>(
  registry: HandlerRegistry,
  eventConstructor: EventConstructor<Event<Type, Payload>>,
  handlerName: string,
  handler: EventHandler<Event<Type, Payload>>,
  queueName?: string,
): void => {
  const eventType = eventConstructor.type;

  const existingEntry = registry.find(
    (entry) => entry.eventConstructor.type === eventType && entry.handlerName === handlerName,
  );

  if (existingEntry) {
    throw new Error(`ハンドラ "${handlerName}" はすでに "${eventType}" イベントに登録されています。`);
  }

  registry.push({
    eventConstructor: eventConstructor as unknown as EventConstructor,
    handlerName,
    handler: handler as unknown as EventHandler,
    queueName: queueName ?? `${eventType}-${handlerName}`,
  });
};

/**
 * イベントのコンストラクタを指定して、登録されているハンドラ名のリストを取得します。
 * @param registry
 * @param eventConstructor
 */
export const getHandlerNames = <Type extends string, Payload>(
  registry: HandlerRegistry,
  eventConstructor: EventConstructor<Event<Type, Payload>>,
): string[] => {
  const eventType = eventConstructor.type;

  const entry = registry.find((entry) => entry.eventConstructor.type === eventType);

  if (!entry) {
    return [];
  }

  return registry
    .filter((handlerEntry) => handlerEntry.eventConstructor.type === eventType)
    .map((handlerEntry) => handlerEntry.handlerName);
};

/**
 * イベントコンストラクタとハンドラ名を指定して、キューの名前を取得します。
 *
 * @param registry ハンドラレジストリを指定します。
 * @param eventConstructor 対象のイベントコンストラクタを指定します。
 * @param handlerName 対象のハンドラ名を指定します。
 * @return キューの名前を返します。存在しない場合はイベント名とハンドラ名から自動生成します。
 */
export const getQueueName = <Type extends string, Payload>(
  registry: HandlerRegistry,
  eventConstructor: EventConstructor<Event<Type, Payload>>,
  handlerName: string,
) => {
  const entry = registry.find((entry) => {
    return entry.eventConstructor.type === eventConstructor.type && entry.handlerName === handlerName;
  });

  return entry?.queueName ?? `${eventConstructor.type}-${handlerName}`;
};

/**
 * イベントとハンドラ名を指定して特定のハンドラを取得します。
 *
 * @param registry ハンドラレジストリ
 * @param eventConstructor イベントコンストラクタ
 * @param handlerName ハンドラ名
 * @returns イベントハンドラ（存在しない場合はundefined）
 */
export const getHandler = <Type extends string, Payload>(
  registry: HandlerRegistry,
  eventConstructor: EventConstructor<Event<Type, Payload>>,
  handlerName: string,
): EventHandler<Event<Type, Payload>> | undefined => {
  const eventType = eventConstructor.type;

  const entry = registry.find(
    (entry) => entry.eventConstructor.type === eventType && entry.handlerName === handlerName,
  );

  if (!entry) {
    return undefined;
  }

  return entry.handler as EventHandler<Event<Type, Payload>>;
};

/**
 * イベント名を指定してイベントコンストラクタを取得します。
 *
 * @param registry ハンドラレジストリ
 * @param eventType イベント名
 * @returns イベントコンストラクタ（存在しない場合はundefined）
 */
export const getEventConstructor = <Type extends string = string, Payload = unknown>(
  registry: HandlerRegistry,
  eventType: string,
): EventConstructor<Event<Type, Payload>> | undefined => {
  const entry = registry.find((entry) => entry.eventConstructor.type === eventType);

  if (!entry) {
    return undefined;
  }

  return entry.eventConstructor as unknown as EventConstructor<Event<Type, Payload>>;
};
