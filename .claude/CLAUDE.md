# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

プラハチャレンジの参加者・チーム・課題を管理するモノレポプロジェクト。DDD（ドメイン駆動設計）に基づいたクリーンアーキテクチャを採用。

## 必須ドキュメント

セッション開始時に以下を必ず参照すること：

@docs/仕様書.md
@docs/コーディング規約.md

## コマンド

```bash
# 開発
pnpm dev                    # 全アプリの開発サーバー起動
pnpm build                  # ビルド
pnpm lint                   # リント
pnpm test                   # 全テスト実行
pnpm format                 # Prettier フォーマット

# 単一パッケージのテスト
pnpm --filter @ponp/participant test

# 単一テストファイル
pnpm --filter @ponp/participant vitest run src/application/use-case/enroll.use-case.test.ts

# DB マイグレーション
pnpm db:generate            # マイグレーションファイル生成
pnpm db:migrate             # マイグレーション実行
```

## アーキテクチャ

### モノレポ構成

- `apps/web` - Next.js フロントエンド
- `packages/participant` - 参加者ドメイン
- `packages/fundamental` - 共通ユーティリティ（Nominal型、エラー、アサーション）
- `packages/testing` - テスト補助（PGlite による DB テスト）
- `packages/event-bus` - イベントバス
- `packages/integration-events` - 境界間イベント定義

### ドメインパッケージ構成（participant を例に）

```
src/
├── domain/           # エンティティ、値オブジェクト、ドメインイベント
├── application/
│   ├── use-case/     # ユースケース（createXxxUseCase パターン）
│   └── port/         # リポジトリ等のインターフェース
└── infrastructure/
    ├── adapter/      # リポジトリ実装（Drizzle）
    └── db/           # DBスキーマ
```

### 主要パターン

**公称型（Nominal Type）**: 識別子・値オブジェクトは `Nominal<T, Tag>` で型安全性を確保

```typescript
type ParticipantId = Nominal<string, "ParticipantId">;
export const ParticipantId = (value: string): ParticipantId => { ... };
ParticipantId.generate = () => ParticipantId(uuid());
```

**ユースケース**: ファクトリ関数パターンで依存性注入

```typescript
type Dependencies = { participantRepository: ParticipantRepository };
export type ExecuteEnrollUseCase = (params: EnrollParams) => Promise<void>;
export const createEnrollUseCase = (deps: Dependencies): ExecuteEnrollUseCase => { ... };
```

**エラー分類**:
- `ValidationError` - 入力値の不正
- `DomainError` - ビジネスルール違反
- `InfrastructureError` - 外部 I/O 失敗（`code` と `cause` 必須）

## 技術スタック

- pnpm + Turborepo
- TypeScript (strict, noUncheckedIndexedAccess)
- Next.js 16 (App Router)
- Drizzle ORM + PostgreSQL
- Vitest + PGlite（テスト用インメモリ DB）
