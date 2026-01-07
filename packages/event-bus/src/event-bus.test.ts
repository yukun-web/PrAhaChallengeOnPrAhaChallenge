import type { Client } from "@upstash/qstash";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { createEventConstructor } from "./create-event-constructor";
import { initEventBus, publish, subscribe } from "./event-bus";
import { createHandlerRegistry, registerHandler } from "./handler-registry";

describe("initEventBus", () => {
  it("認証トークンを指定してイベントバスを初期化できること", () => {
    // 準備
    const authToken = "test-token";

    // 実行
    const eventBus = initEventBus({ authToken });

    // 検証
    expect(eventBus).toBeDefined();
    expect(eventBus).toHaveProperty("handlerRegistry");
    expect(Array.isArray(eventBus.handlerRegistry)).toBe(true);
    expect(eventBus.handlerRegistry).toEqual(createHandlerRegistry());
    expect(eventBus.authToken).toBe(authToken);
  });
});

describe("subscribe", () => {
  it("イベントコンストラクタとハンドラ名を指定してハンドラを登録すること", () => {
    // 準備
    const authToken = "test-token";
    const eventBus = initEventBus({ authToken });
    const TestEvent = createEventConstructor("TEST_EVENT", z.object({ message: z.string() }));
    const handler = vi.fn();

    // 実行
    subscribe(eventBus, TestEvent, "testHandler", handler);

    // 検証
    expect(eventBus.handlerRegistry).toHaveLength(1);
    expect(eventBus.handlerRegistry[0].eventConstructor).toBe(TestEvent);
    expect(eventBus.handlerRegistry[0].handlerName).toBe("testHandler");
    expect(eventBus.handlerRegistry[0].handler).toBe(handler);
  });
});

describe("publish", () => {
  it("イベントを発行し、登録されたハンドラに対してAPIリクエストを行うこと", async () => {
    // 準備
    const authToken = "test-token";
    const eventBus = initEventBus({ authToken });
    const TestEvent = createEventConstructor("TEST_EVENT", z.object({ message: z.string() }));
    const event = TestEvent({ message: "テストメッセージ" });

    // モックの設定
    const mockQueue = {
      enqueueJSON: vi.fn(),
    };

    eventBus.qstash = {
      queue: vi.fn().mockReturnValue(mockQueue),
    } as unknown as Client;

    // registerHandlerを使用してハンドラを直接登録
    registerHandler(eventBus.handlerRegistry, TestEvent, "testHandler", vi.fn());

    // 実行
    await publish(eventBus, event);

    // 検証
    expect(mockQueue.enqueueJSON).toHaveBeenCalledWith({
      url: expect.stringContaining("?event=TEST_EVENT&handler=testHandler"),
      method: "POST",
      body: event,
      headers: expect.objectContaining({
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`,
      }),
    });
  });

  it("ハンドラが登録されていない場合は何もしないこと", async () => {
    // 準備
    const authToken = "test-token";
    const eventBus = initEventBus({ authToken });
    const TestEvent = createEventConstructor("TEST_EVENT", z.object({ message: z.string() }));
    const event = TestEvent({ message: "テストメッセージ" });

    // モックの設定
    global.fetch = vi.fn();

    // 実行
    publish(eventBus, event);

    // 検証
    expect(fetch).not.toHaveBeenCalled();
  });
});
