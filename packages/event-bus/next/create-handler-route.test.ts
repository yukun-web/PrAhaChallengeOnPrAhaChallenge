import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Event, EventConstructor } from "../create-event-constructor";
import type { EventBus } from "../event-bus";
import { createHandlerRegistry } from "../handler-registry";
import { createHandlerRoute } from "./create-handler-route";

// getEventConstructorとgetHandlerのモック
vi.mock("../handler-registry", () => {
  return {
    createHandlerRegistry: vi.fn().mockReturnValue([]),
    getEventConstructor: vi.fn(),
    getHandler: vi.fn(),
    registerHandler: vi.fn(),
    getHandlerNames: vi.fn(),
  };
});

// handler-registryからモジュールをインポート
import type { Client } from "@upstash/qstash";

import { getEventConstructor, getHandler } from "../handler-registry";

describe("createHandlerRoute", () => {
  // モック用のイベントとハンドラ
  const mockEvent = {
    id: "test-id",
    type: "TEST_EVENT",
    payload: { text: "テストメッセージ" },
  } as Event;

  const mockEventConstructor = {
    reconstruct: vi.fn().mockReturnValue(mockEvent),
  } as unknown as EventConstructor;
  Object.defineProperty(mockEventConstructor, "type", { value: "TEST_EVENT" });

  const mockHandler = vi.fn();

  // EventBusのモック
  let mockEventBus: EventBus;

  beforeEach(() => {
    mockEventBus = {
      handlerRegistry: createHandlerRegistry(),
      authToken: "default-token",
      qstash: {} as Client,
    };

    // モックをリセット
    vi.clearAllMocks();

    // デフォルトのモック実装を設定
    const getEventConstructorMock = getEventConstructor as unknown as { mockReturnValue: (value: unknown) => void };
    getEventConstructorMock.mockReturnValue(mockEventConstructor);

    const getHandlerMock = getHandler as unknown as { mockReturnValue: (value: unknown) => void };
    getHandlerMock.mockReturnValue(mockHandler);
  });

  it("クエリパラメータからイベント名とハンドラ名を取得し、ハンドラを実行すること", async () => {
    // 準備
    const handlerRoute = createHandlerRoute(mockEventBus);

    const request = new NextRequest("http://localhost:3000/api/event-bus?event=TEST_EVENT&handler=testHandler", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mockEventBus.authToken}`,
      },
      body: JSON.stringify(mockEvent),
    });

    // 実行
    const response = await handlerRoute(request);

    // 検証
    expect(response).toBeInstanceOf(NextResponse);
    expect(response.status).toBe(200);
    expect(mockHandler).toHaveBeenCalledWith(mockEvent);
  });

  it("イベント名が指定されていない場合は400エラーを返すこと", async () => {
    // 準備
    const handlerRoute = createHandlerRoute(mockEventBus);

    const request = new NextRequest("http://localhost:3000/api/event-bus?handler=testHandler", {
      method: "POST",
      body: JSON.stringify(mockEvent),
    });

    // 実行
    const response = await handlerRoute(request);

    // 検証
    expect(response).toBeInstanceOf(NextResponse);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "イベント名が指定されていません" });
    expect(mockHandler).not.toHaveBeenCalled();
  });

  it("ハンドラ名が指定されていない場合は400エラーを返すこと", async () => {
    // 準備
    const handlerRoute = createHandlerRoute(mockEventBus);

    const request = new NextRequest("http://localhost:3000/api/event-bus?event=TEST_EVENT", {
      method: "POST",
      body: JSON.stringify(mockEvent),
    });

    // 実行
    const response = await handlerRoute(request);

    // 検証
    expect(response).toBeInstanceOf(NextResponse);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "ハンドラ名が指定されていません" });
    expect(mockHandler).not.toHaveBeenCalled();
  });

  it("イベントコンストラクタが見つからない場合は404エラーを返すこと", async () => {
    // 準備
    const handlerRoute = createHandlerRoute(mockEventBus);

    // イベントコンストラクタが見つからないようにモックを変更
    const getEventConstructorMock = getEventConstructor as unknown as { mockReturnValue: (value: unknown) => void };
    getEventConstructorMock.mockReturnValue(undefined);

    const request = new NextRequest("http://localhost:3000/api/event-bus?event=UNKNOWN_EVENT&handler=testHandler", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mockEventBus.authToken}`,
      },
      body: JSON.stringify(mockEvent),
    });

    // 実行
    const response = await handlerRoute(request);

    // 検証
    expect(response).toBeInstanceOf(NextResponse);
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "イベントが見つかりません: UNKNOWN_EVENT" });
    expect(mockHandler).not.toHaveBeenCalled();
  });

  it("ハンドラが見つからない場合は404エラーを返すこと", async () => {
    // 準備
    const handlerRoute = createHandlerRoute(mockEventBus);

    // ハンドラが見つからないようにモックを変更
    const getHandlerMock = getHandler as unknown as { mockReturnValue: (value: unknown) => void };
    getHandlerMock.mockReturnValue(undefined);

    const request = new NextRequest("http://localhost:3000/api/event-bus?event=TEST_EVENT&handler=unknownHandler", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mockEventBus.authToken}`,
      },
      body: JSON.stringify(mockEvent),
    });

    // 実行
    const response = await handlerRoute(request);

    // 検証
    expect(response).toBeInstanceOf(NextResponse);
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "ハンドラが見つかりません: unknownHandler" });
    expect(mockHandler).not.toHaveBeenCalled();
  });

  describe("認証機能", () => {
    const authToken = "test-auth-token";

    beforeEach(() => {
      // 認証トークン付きのEventBusを設定
      mockEventBus = {
        handlerRegistry: createHandlerRegistry(),
        authToken,
        qstash: {} as Client,
      };
    });

    it("有効な認証トークンでリクエストが成功すること", async () => {
      // 準備
      const handlerRoute = createHandlerRoute(mockEventBus);

      const request = new NextRequest("http://localhost:3000/api/event-bus?event=TEST_EVENT&handler=testHandler", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(mockEvent),
      });

      // 実行
      const response = await handlerRoute(request);

      // 検証
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);
      expect(mockHandler).toHaveBeenCalledWith(mockEvent);
    });

    it("認証ヘッダーがない場合は401エラーを返すこと", async () => {
      // 準備
      const handlerRoute = createHandlerRoute(mockEventBus);

      const request = new NextRequest("http://localhost:3000/api/event-bus?event=TEST_EVENT&handler=testHandler", {
        method: "POST",
        body: JSON.stringify(mockEvent),
      });

      // 実行
      const response = await handlerRoute(request);

      // 検証
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: "認証ヘッダーがありません" });
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it("無効な認証トークンの場合は403エラーを返すこと", async () => {
      // 準備
      const handlerRoute = createHandlerRoute(mockEventBus);

      const request = new NextRequest("http://localhost:3000/api/event-bus?event=TEST_EVENT&handler=testHandler", {
        method: "POST",
        headers: {
          Authorization: "Bearer invalid-token",
        },
        body: JSON.stringify(mockEvent),
      });

      // 実行
      const response = await handlerRoute(request);

      // 検証
      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(403);
      expect(await response.json()).toEqual({ error: "無効な認証トークンです" });
      expect(mockHandler).not.toHaveBeenCalled();
    });
  });
});
