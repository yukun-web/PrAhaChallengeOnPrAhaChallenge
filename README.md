# PrAha Challenge on PrAha Challenge

プラハチャレンジの参加者・チーム・課題を管理するモノレポプロジェクト。
DDD（ドメイン駆動設計）に基づいたクリーンアーキテクチャを採用。

## 実装状況

### ✅ 実装済み

- **参加者ドメイン**
  - エンティティ・値オブジェクト
  - ユースケース（入会、休会、復帰、退会）
  - メールアドレス重複チェック
- **イベントバス基盤**
- **フロントエンド**（参加者操作フォーム）

### ❌ 未実装

- **チームドメイン**
  - チームエンティティ・値オブジェクト
  - チーム名バリデーション（英文字のみ、重複不可）
  - チーム人数制約（2〜4名）
- **課題ドメイン**
  - 課題エンティティ・値オブジェクト
  - 進捗ステータス管理
  - ステータス遷移ルール
- **参加者増減の自動処理**
  - チーム人数チェックとメール通知
  - 1名チームの自動合流
  - 復帰時の自動チーム割り当て
  - 5名チームの自動分割

---

## 開発状況

### 📊 プロジェクトボード

- 👉 [全体ボード](https://github.com/yukun-web/PrAhaChallengeOnPrAhaChallenge/projects/1)
- 👉 [着手可能タスク](https://github.com/yukun-web/PrAhaChallengeOnPrAhaChallenge/issues?q=is%3Aopen+label%3Aparallel%2Fok)

### 📈 進捗サマリー（Milestones）

| ストリーム | 説明 | リンク |
|-----------|------|--------|
| team-domain | チームドメイン開発 | [Milestone](https://github.com/yukun-web/PrAhaChallengeOnPrAhaChallenge/milestone/1) |
| task-domain | 課題ドメイン開発 | [Milestone](https://github.com/yukun-web/PrAhaChallengeOnPrAhaChallenge/milestone/2) |
| notification | 通知基盤 | [Milestone](https://github.com/yukun-web/PrAhaChallengeOnPrAhaChallenge/milestone/3) |
| integration | 統合・結合 | [Milestone](https://github.com/yukun-web/PrAhaChallengeOnPrAhaChallenge/milestone/4) |
| frontend | フロントエンド | [Milestone](https://github.com/yukun-web/PrAhaChallengeOnPrAhaChallenge/milestone/5) |

### 🔗 クイックリンク

- [即時着手可（parallel/ok）](https://github.com/yukun-web/PrAhaChallengeOnPrAhaChallenge/issues?q=is%3Aopen+label%3Aparallel%2Fok)
- [依存待ち（parallel/blocked）](https://github.com/yukun-web/PrAhaChallengeOnPrAhaChallenge/issues?q=is%3Aopen+label%3Aparallel%2Fblocked)
- [全 Issue 一覧](https://github.com/yukun-web/PrAhaChallengeOnPrAhaChallenge/issues)

---

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

# worktree 管理
pnpm worktree:new           # 新規 worktree 作成（自動採番）
pnpm worktree:close         # 現在の worktree を削除
```

---

## アーキテクチャ

### モノレポ構成

```
./
├── apps/
│   └── web/              # Next.js フロントエンド
├── packages/
│   ├── participant/      # 参加者ドメイン
│   ├── fundamental/      # 共通ユーティリティ
│   ├── testing/          # テスト補助（PGlite）
│   ├── event-bus/        # イベントバス
│   └── integration-events/ # 境界間イベント定義
└── docs/                 # ドキュメント
```

### ドメインパッケージ構成

```
packages/participant/src/
├── domain/           # エンティティ、値オブジェクト、ドメインイベント
├── application/
│   ├── use-case/     # ユースケース
│   └── port/         # リポジトリ等のインターフェース
└── infrastructure/
    ├── adapter/      # リポジトリ実装（Drizzle）
    └── db/           # DBスキーマ
```

---

## ドキュメント

- [仕様書](docs/仕様書.md)
- [コーディング規約](docs/コーディング規約.md)
- [開発運用ガイド](docs/開発運用ガイド.md)

---

## 技術スタック

- **モノレポ**: pnpm + Turborepo
- **言語**: TypeScript (strict, noUncheckedIndexedAccess)
- **フロントエンド**: Next.js 16 (App Router)
- **ORM**: Drizzle ORM + PostgreSQL
- **テスト**: Vitest + PGlite（インメモリ DB）
