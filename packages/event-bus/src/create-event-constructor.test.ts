import { describe, expect, test } from "vitest";
import { z } from "zod";

import { createEventConstructor } from "./create-event-constructor";

describe("createEventConstructor", () => {
  const testEventSchema = z.object({
    message: z.string(),
    count: z.number().int().positive(),
  });

  test("イベントコンストラクタが正しく作成されること", () => {
    const TestEvent = createEventConstructor("TEST_EVENT", testEventSchema);
    expect(TestEvent.type).toBe("TEST_EVENT");
    expect(typeof TestEvent).toBe("function");
  });

  test("有効なペイロードでイベントが正しく生成されること", () => {
    const TestEvent = createEventConstructor("TEST_EVENT", testEventSchema);
    const payload = { message: "テストメッセージ", count: 1 };
    const event = TestEvent(payload);

    expect(event.type).toBe("TEST_EVENT");
    expect(typeof event.id).toBe("string");
    expect(event.id.length).toBeGreaterThan(0);
    expect(event.payload).toEqual(payload);
  });

  test("無効なペイロードでエラーがスローされること", () => {
    const TestEvent = createEventConstructor("TEST_EVENT", testEventSchema);
    const invalidPayload = { message: "テストメッセージ", count: -1 }; // count は正の整数である必要がある

    expect(() => TestEvent(invalidPayload)).toThrow();
  });
});
