import { describe, expect, test, vi } from "vitest";
import { z } from "zod";

import { createEventConstructor, type EventConstructor } from "./create-event-constructor";
import {
  createHandlerRegistry,
  type EventHandler,
  getEventConstructor,
  getHandler,
  getHandlerNames,
  registerHandler,
} from "./handler-registry";

describe("handler-registry", () => {
  /**
   * テスト用のイベントスキーマ
   */
  const testEventSchema = z.object({
    message: z.string(),
  });

  /**
   * テスト用のイベントコンストラクタ
   */
  const TestEvent = createEventConstructor("TEST_EVENT", testEventSchema);

  /**
   * 別のテスト用のイベントコンストラクタ
   */
  const AnotherTestEvent = createEventConstructor("ANOTHER_TEST_EVENT", testEventSchema);

  /**
   * テスト用のイベントハンドラ
   */
  const testHandler: EventHandler = vi.fn();

  /**
   * 別のテスト用のイベントハンドラ
   */
  const anotherTestHandler: EventHandler = vi.fn();

  describe("createHandlerRegistry", () => {
    test("空のハンドラレジストリが作成されること", () => {
      const registry = createHandlerRegistry();
      expect(registry).toEqual([]);
      expect(Array.isArray(registry)).toBe(true);
    });
  });

  describe("registerHandler", () => {
    test("ハンドラが正しく登録されること", () => {
      const registry = createHandlerRegistry();
      registerHandler(registry, TestEvent, "testHandler", testHandler);

      expect(registry.length).toBe(1);
      expect(registry[0].eventConstructor).toBe(TestEvent);
      expect(registry[0].handlerName).toBe("testHandler");
      expect(registry[0].handler).toBe(testHandler);
    });

    test("同じイベントタイプに対して異なるハンドラ名で登録できること", () => {
      const registry = createHandlerRegistry();
      registerHandler(registry, TestEvent, "testHandler", testHandler);
      registerHandler(registry, TestEvent, "anotherTestHandler", anotherTestHandler);

      expect(registry.length).toBe(2);
      expect(registry[0].eventConstructor).toBe(TestEvent);
      expect(registry[0].handlerName).toBe("testHandler");
      expect(registry[0].handler).toBe(testHandler);
      expect(registry[1].eventConstructor).toBe(TestEvent);
      expect(registry[1].handlerName).toBe("anotherTestHandler");
      expect(registry[1].handler).toBe(anotherTestHandler);
    });

    test("同じイベントタイプと同じハンドラ名で登録しようとするとエラーがスローされること", () => {
      const registry = createHandlerRegistry();
      registerHandler(registry, TestEvent, "testHandler", testHandler);

      expect(() => {
        registerHandler(registry, TestEvent, "testHandler", anotherTestHandler);
      }).toThrow("ハンドラ \"testHandler\" はすでに \"TEST_EVENT\" イベントに登録されています。");
    });

    test("異なるイベントタイプに対してハンドラを登録できること", () => {
      const registry = createHandlerRegistry();
      registerHandler(registry, TestEvent, "testHandler", testHandler);
      registerHandler(registry, AnotherTestEvent, "anotherTestHandler", anotherTestHandler);

      expect(registry.length).toBe(2);
      expect(registry[0].eventConstructor).toBe(TestEvent);
      expect(registry[0].handlerName).toBe("testHandler");
      expect(registry[0].handler).toBe(testHandler);
      expect(registry[1].eventConstructor).toBe(AnotherTestEvent);
      expect(registry[1].handlerName).toBe("anotherTestHandler");
      expect(registry[1].handler).toBe(anotherTestHandler);
    });
  });

  describe("getHandlerNames", () => {
    test("登録されているハンドラ名のリストを取得できること", () => {
      const registry = createHandlerRegistry();
      registerHandler(registry, TestEvent, "testHandler", testHandler);

      const handlerNames = getHandlerNames(registry, TestEvent as EventConstructor);
      expect(handlerNames).toEqual(["testHandler"]);
    });

    test("登録されていないイベントタイプの場合は空の配列が返されること", () => {
      const registry = createHandlerRegistry();
      registerHandler(registry, TestEvent, "testHandler", testHandler);

      const handlerNames = getHandlerNames(registry, AnotherTestEvent);
      expect(handlerNames).toEqual([]);
    });
  });

  describe("getHandler", () => {
    test("登録されているハンドラを取得できること", () => {
      const registry = createHandlerRegistry();
      registerHandler(registry, TestEvent, "testHandler", testHandler);

      const handler = getHandler(registry, TestEvent, "testHandler");
      expect(handler).toBe(testHandler);
    });

    test("登録されていないイベントタイプの場合はundefinedが返されること", () => {
      const registry = createHandlerRegistry();
      registerHandler(registry, TestEvent, "testHandler", testHandler);

      const handler = getHandler(registry, AnotherTestEvent, "testHandler");
      expect(handler).toBeUndefined();
    });

    test("登録されていないハンドラ名の場合はundefinedが返されること", () => {
      const registry = createHandlerRegistry();
      registerHandler(registry, TestEvent, "testHandler", testHandler);

      const handler = getHandler(registry, TestEvent, "nonExistentHandler");
      expect(handler).toBeUndefined();
    });
  });

  describe("getEventConstructor", () => {
    test("イベント名からイベントコンストラクタを取得できること", () => {
      const registry = createHandlerRegistry();
      registerHandler(registry, TestEvent, "testHandler", testHandler);

      const eventConstructor = getEventConstructor(registry, "TEST_EVENT");
      expect(eventConstructor).toBe(TestEvent);
    });

    test("登録されていないイベント名の場合はundefinedが返されること", () => {
      const registry = createHandlerRegistry();
      registerHandler(registry, TestEvent, "testHandler", testHandler);

      const eventConstructor = getEventConstructor(registry, "NON_EXISTENT_EVENT");
      expect(eventConstructor).toBeUndefined();
    });
  });
});
