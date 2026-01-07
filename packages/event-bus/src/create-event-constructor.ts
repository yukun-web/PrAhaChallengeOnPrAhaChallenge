import { uuid } from "@ponp/fundamental";
import type { z } from "zod";

/**
 * イベントの型定義です。
 */
export type Event<Type extends string = string, Payload = unknown> = {
  type: Type;
  id: string;
  payload: Payload;
};

/**
 * イベントコンストラクタの型定義です。
 */
export type EventConstructor<E extends Event = Event> = {
  (payload: E["payload"]): E;
  type: E["type"];
  reconstruct: (event: E) => E;
};

/**
 * イベントのコンストラクタを作成するヘルパー関数です。
 *
 * @param type イベントのタイプを指定します。
 * @param schema イベントのペイロードのスキーマを指定します。
 * @returns イベントを生成する関数を返します。
 */
export const createEventConstructor = <Type extends string, T extends z.ZodType>(
  type: Type,
  schema: T,
): EventConstructor<Event<Type, z.infer<T>>> => {
  type EventPayload = z.infer<T>;

  const EventConstructor = (payload: EventPayload): Event<Type, EventPayload> => {
    const validatedPayload = schema.parse(payload);

    return {
      type,
      id: uuid(),
      payload: validatedPayload,
    };
  };

  EventConstructor.type = type;

  EventConstructor.reconstruct = (event: Event<Type, EventPayload>): Event<Type, EventPayload> => {
    const validatedPayload = schema.parse(event.payload);

    return {
      type: event.type,
      id: event.id,
      payload: validatedPayload,
    };
  };

  return EventConstructor;
};
