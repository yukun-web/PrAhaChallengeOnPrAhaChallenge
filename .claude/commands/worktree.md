---
description: 並行開発用の git worktree を作成し、重複しないポートを自動設定する
arguments:
  - name: branch
    description: 作成するブランチ名
    required: true
  - name: base
    description: ベースブランチ名（省略時は main）
    required: false
---

並行開発用の git worktree を新規作成し、ポートが重複しないよう .env.local を設定します。

## 手順

1. **空きポートを決定**
   - 親ディレクトリ内の既存 worktree ディレクトリ名からポートを抽出
   - ディレクトリ名パターン: `<basename>-<POSTGRES_PORT>-<QSTASH_PORT>-<WEB_PORT>`
   - 例: `PrAhaChallengeOnPrAhaChallenge-54321-8081-3001`
   - 使用済みポートと重複しないポートを選択
   - 基準値（デフォルトポート + 1 から探索）:
     - POSTGRES_PORT: 54321 から探索
     - QSTASH_PORT: 8081 から探索
     - WEB_PORT: 3001 から探索

2. **worktree を作成**
   - ディレクトリ: `../$(basename $PWD)-<POSTGRES_PORT>-<QSTASH_PORT>-<WEB_PORT>`
   - ベースブランチ: `$arguments.base`（省略時は `main`）
   - コマンド: `git worktree add -b $arguments.branch <directory> <base>`

3. **ルートの .env.local を作成**
   `<worktree>/.env.local` を作成:
   ```
   POSTGRES_PORT=<空きポート>
   QSTASH_PORT=<空きポート>
   POSTGRES_URL=postgresql://ponp:ponp@localhost:<POSTGRES_PORT>/ponp
   ```

4. **apps/web/.env.local を作成**
   `<worktree>/apps/web/.env.local` を作成:
   ```
   POSTGRES_URL=postgresql://ponp:ponp@localhost:<POSTGRES_PORT>/ponp
   QSTASH_URL=http://localhost:<QSTASH_PORT>
   PORT=<WEB_PORT>
   ```

5. **結果を出力**
   - 作成した worktree のパス
   - 割り当てたポート番号
   - 起動コマンド: `cd <worktree> && pnpm docker:up`
