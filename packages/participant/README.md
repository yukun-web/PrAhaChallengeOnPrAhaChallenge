# @ponp/participant - 参加者モジュール

参加者の入会・休会・復帰・退会を扱うモジュールです。

## 使い方

### クイックスタート

起動時にモジュールを作成し、アプリの処理から呼び出します。

```ts
// bootstrap.ts
import { Database, createDrizzleDatabase } from "@ponp/fundamental";
import { createParticipantModule } from "@ponp/participant";

const db: Database = createDrizzleDatabase();

export const participantModule = createParticipantModule({ db });
```

```ts
// app.ts
import { enrollNewParticipant } from "@ponp/participant";
import { participantModule } from "../bootstrap"; // モジュールを作成したファイル

await enrollNewParticipant(participantModule, {
  name: "Taro",
  email: "taro@example.com",
});
```

## 公開 API

### createParticipantModule

参加者モジュールを作成します。

| 項目 | 内容 |
| --- | --- |
| 引数 | `db`: `@ponp/fundamental` で定義される Drizzle の Database インスタンス |
| 返り値 | 参加者操作の関数をまとめた `ParticipantModule` |
| 例外 | なし |

### enrollNewParticipant

新しい参加者を入会状態で作成し、保存します。

| 項目 | 内容 |
| --- | --- |
| 引数 | `name`: 参加者名<br>`email`: 参加者のメールアドレス |
| 返り値 | `Promise<void>` |
| 例外 | `ValidationError`: `name` / `email` が不正な場合<br>`InfrastructureError`: 保存に失敗した場合 |

#### 例

```ts
await enrollNewParticipant(participantModule, {
  name: "Taro",
  email: "taro@example.com",
});
```

### suspendParticipant

参加者を休会状態に変更し、保存します。

| 項目 | 内容 |
| --- | --- |
| 引数 | `participantId`: 参加者 ID（UUID 形式） |
| 返り値 | `Promise<void>` |
| 例外 | `ValidationError`: `participantId` が不正な場合<br>`DomainError`: 状態が遷移できない場合（例: 既に休会中など）<br>`InfrastructureError`: 取得または保存に失敗した場合 |

#### 例

```ts
await suspendParticipant(participantModule, {
  participantId: "27ededf6-e5c3-4eb2-b0ff-5f67e892e096",
});
```

### reactivateParticipant

休会中の参加者を復帰状態に変更し、保存します。

| 項目 | 内容 |
| --- | --- |
| 引数 | `participantId`: 参加者 ID（UUID 形式） |
| 返り値 | `Promise<void>` |
| 例外 | `ValidationError`: `participantId` が不正な場合<br>`DomainError`: 状態が遷移できない場合（例: 休会中ではないなど）<br>`InfrastructureError`: 取得または保存に失敗した場合 |

#### 例

```ts
await reactivateParticipant(participantModule, {
  participantId: "27ededf6-e5c3-4eb2-b0ff-5f67e892e096",
});
```

### withdrawParticipant

参加者を退会状態に変更し、保存します。

| 項目 | 内容 |
| --- | --- |
| 引数 | `participantId`: 参加者 ID（UUID 形式） |
| 返り値 | `Promise<void>` |
| 例外 | `ValidationError`: `participantId` が不正な場合<br>`DomainError`: 状態が遷移できない場合<br>`InfrastructureError`: 取得または保存に失敗した場合 |

#### 例

```ts
await withdrawParticipant(participantModule, {
  participantId: "27ededf6-e5c3-4eb2-b0ff-5f67e892e096",
});
```

## エラー

- `ValidationError`: 入力値の形式や内容が不正な場合
- `DomainError`: 状態遷移が不正な場合
- `InfrastructureError`: DB への保存や取得が失敗した場合

## テスト

このパッケージ単体のテスト:

```sh
pnpm test
```
