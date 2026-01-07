import type { Event, EventConstructor } from "./create-event-constructor";

/**
 * イベントハンドラの型定義です。
 */
export type EventHandler<E extends Event = Event> = (event: E) => unknown;

/**
 * イベントハンドラのエントリーの型定義です。
 */
export type EventHandlerEntry = {
  /**
   * 対象のイベントコンストラクタです。
   */
  eventConstructor: EventConstructor;
  /**
   * イベントハンドラの名前です。
   */
  handlerName: string;
  /**
   * イベントハンドラです。
   */
  handler: EventHandler;
  /**
   * イベントの処理対象となるキューの名前です。
   */
  queueName: string;
};

/**
 * ハンドラレジストリの型定義です。
 */
export type HandlerRegistry = EventHandlerEntry[];

/**
 * 空のハンドラレジストリを作成します。
 *
 * @returns 空のハンドラレジストリを返します。
 */
export const createHandlerRegistry = (): EventHandlerEntry[] => {
  return [];
};

/**
 * イベントコンストラクタとハンドラ名を指定してハンドラを登録します。
 *
 * @param registry ハンドラレジストリを指定します。
 * @param eventConstructor イベントコンストラクタを指定します。
 * @param handlerName ハンドラ名を指定します。
 * @param handler イベントハンドラを指定します。
 * @param queueName イベントを受け取るキューの名前を指定します（指定しない場合はイベント名とハンドラ名から自動生成されます）。
 * @returns 何も返しません。
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
 *
 * @param registry ハンドラレジストリを指定します。
 * @param eventConstructor イベントコンストラクタを指定します。
 * @returns ハンドラ名のリストを返します。
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
 * @returns キューの名前を返します。存在しない場合はイベント名とハンドラ名から自動生成します。
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
 * @param registry ハンドラレジストリを指定します。
 * @param eventConstructor イベントコンストラクタを指定します。
 * @param handlerName ハンドラ名を指定します。
 * @returns イベントハンドラを返します（存在しない場合は undefined を返します）。
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
 * @param registry ハンドラレジストリを指定します。
 * @param eventType イベント名を指定します。
 * @returns イベントコンストラクタを返します（存在しない場合は undefined を返します）。
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
