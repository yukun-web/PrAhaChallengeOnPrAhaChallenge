---
description: 並行開発用の git worktree を作成し、重複しないポートを自動設定する
---

並行開発用の git worktree を新規作成し、ポートが重複しないよう .env.local を設定します。

## 手順

1. **対話形式でブランチ情報を確認**
   - AskUserQuestion ツールを使用して以下を確認:
     - 作成するブランチ名
     - ベースブランチ名（デフォルト: main）

2. **ポートを計算**
   - `git worktree list` で現在の worktree 数を取得
   - ポート番号 = デフォルトポート + worktree数 + 1
   - デフォルトポート:
     - POSTGRES_PORT: 54320
     - QSTASH_PORT: 8080
     - WEB_PORT: 3000
   - 例: worktree が 2 つある場合、POSTGRES_PORT = 54320 + 2 + 1 = 54323

3. **worktree を作成**
   - ディレクトリ名: タイムスタンプ形式 `worktree-YYYYMMDD-HHMMSS`
   - ディレクトリ: `../<タイムスタンプ>`
   - コマンド: `git worktree add -b <ブランチ名> <directory> <ベースブランチ>`

4. **ルートの .env.local を作成**
   `<worktree>/.env.local` を作成:
   ```
   POSTGRES_PORT=<計算したポート>
   QSTASH_PORT=<計算したポート>
   POSTGRES_URL=postgresql://ponp:ponp@localhost:<POSTGRES_PORT>/ponp
   ```

5. **apps/web/.env.local を作成**
   `<worktree>/apps/web/.env.local` を作成:
   ```
   POSTGRES_URL=postgresql://ponp:ponp@localhost:<POSTGRES_PORT>/ponp
   QSTASH_URL=http://localhost:<QSTASH_PORT>
   PORT=<WEB_PORT>
   ```

6. **結果を出力**
   - 作成した worktree のパス
   - 割り当てたポート番号
   - 起動コマンド: `cd <worktree> && pnpm docker:up`
