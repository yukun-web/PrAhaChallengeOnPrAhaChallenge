import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { EventBus } from "../event-bus";
import { getEventConstructor, getHandler } from "../handler-registry";

/**
 * Next.js App Router用のAPIルートを作成します。
 * eventBusを受け取り、POSTリクエストを処理するハンドラ関数を返します。
 *
 * @param eventBus イベントバス
 * @returns POSTリクエストを処理するハンドラ関数
 */
export const createHandlerRoute = (eventBus: EventBus) => {
  return async (request: NextRequest): Promise<NextResponse> => {
    const searchParams = request.nextUrl.searchParams;
    const eventType = searchParams.get("event");
    const handlerName = searchParams.get("handler");

    if (!eventType) {
      return NextResponse.json({ error: "イベント名が指定されていません" }, { status: 400 });
    }

    if (!handlerName) {
      return NextResponse.json({ error: "ハンドラ名が指定されていません" }, { status: 400 });
    }

    // 認証トークンが設定されている場合は認証チェックを行う
    if (eventBus.authToken) {
      const authHeader = request.headers.get("Authorization");

      if (!authHeader) {
        return NextResponse.json({ error: "認証ヘッダーがありません" }, { status: 401 });
      }

      const token = authHeader.replace("Bearer ", "");

      if (token !== eventBus.authToken) {
        return NextResponse.json({ error: "無効な認証トークンです" }, { status: 403 });
      }
    }

    try {
      const EventConstructor = getEventConstructor(eventBus.handlerRegistry, eventType);
      if (!EventConstructor) {
        return NextResponse.json({ error: `イベントが見つかりません: ${eventType}` }, { status: 404 });
      }

      const handler = getHandler(eventBus.handlerRegistry, EventConstructor, handlerName);
      if (!handler) {
        return NextResponse.json({ error: `ハンドラが見つかりません: ${handlerName}` }, { status: 404 });
      }

      const eventData = await request.json();
      const event = EventConstructor.reconstruct(eventData);
      await handler(event);

      return NextResponse.json({ success: true }, { status: 200 });
    }
    catch (error) {
      console.error(error);
      return NextResponse.json({ error: "内部サーバーエラーが発生しました" }, { status: 500 });
    }
  };
};
