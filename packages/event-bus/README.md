# @ponp/event-bus

@ponp/event-bus は、ドメインイベントを用いてコンテキスト間の連携を行うためのモジュールです。  
ドメインイベントを発行し、リスナーがそれを購読することで非同期な処理を実現します。

## 使い方

### イベントのスキーマ定義

スキーマ定義には Zod を使用します。

```typescript
import { createEventConstructor } from "@ponp/event-bus";
import { z } from "zod";

const sampleEventSchema = z.object({
  text: z.string(),
});

export const SampleEvent = createEventConstructor("SAMPLE_EVENT", sampleEventSchema);

export type SampleEvent = ReturnType<typeof SampleEvent>;

const event = SampleEvent({
  text: "Hello, World!",
});

console.log(SampleEvent.type); // "SAMPLE_EVENT"
console.log(event.type); // "SAMPLE_EVENT"
console.log(event.id); // 自動生成ID
console.log(event.payload); // { text: "Hello, World!" }
```

### イベントバスの初期化

```typescript
import { initEventBus } from "@ponp/event-bus";

const eventBus = initEventBus({ authToken: process.env.EVENT_BUS_AUTH_TOKEN ?? "" });
```

### イベント購読用のエンドポイントを作成

```typescript
// app/api/event-bus/route.ts
import { createHandlerRoute } from "@ponp/event-bus/next";
import { eventBus } from "@/app/bootstrap";

export const POST = createHandlerRoute(eventBus);
```

### イベントの発行

```typescript
import { publish } from "@ponp/event-bus";
import { eventBus } from "@/app/bootstrap";

import { SampleEvent } from "./events";

const event = SampleEvent({ text: "Hello, World!" });

await publish(eventBus, event);
```

### イベントの購読

```typescript
import { subscribe } from "@ponp/event-bus";
import { eventBus } from "@/app/bootstrap";

import { SampleEvent } from "./events";

subscribe(eventBus, SampleEvent, "sampleHandler", (event: SampleEvent) => {
  console.log(event.payload.text); // "Hello, World!"
});
```

## ざっくりとした仕組み

API 呼び出しを行うことで、イベントハンドラが別プロセスとして実行されるようになります。  
これによって Vercel のタイムアウトを回避し、非同期な処理を実現します。

```mermaid
sequenceDiagram
  actor Publisher as イベント発行者
  actor Subscriber as イベント購読者
  participant EventBus as イベントバス
  participant API as API Route
  participant HandlerRegistry as ハンドラレジストリ
  participant EventHandler as イベントハンドラ

  Subscriber ->>+ EventHandler: 定義
  activate Subscriber
  EventHandler -->>- Subscriber: イベントハンドラ
  Subscriber ->> EventBus: 購読()
  deactivate Subscriber
  activate EventBus
  note over Subscriber: イベントのコンストラクタと<br>イベントハンドラと<br>イベントハンドラの名前を指定します
  EventBus ->> HandlerRegistry: ハンドラを登録
  deactivate EventBus

  Publisher ->>+ EventBus: 発行(イベント)
  EventBus ->>+ HandlerRegistry: 登録されているハンドラ名のリストを取得(イベント名)
  HandlerRegistry -->>- EventBus: ハンドラ名のリスト

  loop ハンドラ名 in ハンドラ名のリスト
    EventBus ->> API: POST /api/event-bus<br>?event=[イベント名]&handler=[ハンドラ名]
    activate API
    note over EventBus, API: ボディにイベントの内容をJSONで含めます
    API ->>+ HandlerRegistry: イベントのコンストラクタを取得(イベント名)
    HandlerRegistry -->>- API: コンストラクタ
    API ->> API: イベントを生成
    API ->>+ HandlerRegistry: ハンドラを取得(イベント, ハンドラ名)
    HandlerRegistry -->>- API: ハンドラ

    API ->> EventHandler: ハンドラを実行(イベント)
    deactivate API
  end
```
