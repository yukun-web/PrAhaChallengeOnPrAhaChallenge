import { createHandlerRoute } from "@ponp/event-bus/next";

import { eventBus } from "../../../bootstrap";

/**
 * @ponp/event-bus でイベントを受け取るためのエンドポイントです。
 */
export const POST = createHandlerRoute(eventBus);
