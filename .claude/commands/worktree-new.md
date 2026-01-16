---
description: 並行開発用の git worktree を作成し、重複しないポートを自動設定する
---

並行開発用の git worktree を新規作成し、ポートが重複しないよう .env.local を設定します。

## 手順

1. **タイムスタンプを生成**
   - 形式: `YYYYMMDD-HHMMSS`（例: `20260116-213508`）
   - このタイムスタンプをディレクトリ名とブランチ名の両方で使用

2. **ポートを計算**
   - `git worktree list` で現在の worktree 数を取得
   - ポート番号 = デフォルトポート + worktree数 + 1
   - デフォルトポート:
     - POSTGRES_PORT: 54320
     - QSTASH_PORT: 8080
     - WEB_PORT: 3000
   - 例: worktree が 2 つある場合、POSTGRES_PORT = 54320 + 2 + 1 = 54323

3. **worktree を作成**
   - ディレクトリ名: `<現在のディレクトリ名>-<タイムスタンプ>` 形式（例: `PrAhaChallengeOnPrAhaChallenge-20260116-213508`）
   - ブランチ名: `worktree-<タイムスタンプ>` 形式（例: `worktree-20260116-213508`）
   - ベースブランチ: `main`（固定）
   - ディレクトリ: `../<ディレクトリ名>`
   - コマンド: `git worktree add -b worktree-<タイムスタンプ> <directory> main`

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

6. **WebStorm を起動（オプション）**
   - `which webstorm` で webstorm コマンドが有効か確認
   - 有効な場合: `webstorm <worktree のパス>` で WebStorm を起動

7. **結果を出力**
   - 作成した worktree のパス
   - 割り当てたポート番号
   - 起動コマンド: `cd <worktree> && pnpm docker:up`
