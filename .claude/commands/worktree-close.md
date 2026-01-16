---
description: 現在のディレクトリの git worktree を削除し、ディレクトリも削除する
---

現在の作業ディレクトリが git worktree である場合、その worktree を削除し、ディレクトリ自体も削除します。

## 手順

1. **worktree かどうか確認**
   - `git rev-parse --show-toplevel` で現在のリポジトリルートを取得
   - `git worktree list` で worktree 一覧を取得
   - 現在のディレクトリがメインの worktree（最初に表示されるもの）の場合はエラーとして中断
     - メッセージ: 「メインのワークツリーは削除できません」

2. **対話形式で確認**
   - AskUserQuestion ツールを使用して削除の確認:
     - 「現在の worktree `<ディレクトリパス>` を削除してもよいですか？」
     - 選択肢: 「はい、削除する」「いいえ、キャンセル」
   - 「いいえ」の場合は中断

3. **未コミットの変更を確認**
   - `git status --porcelain` で未コミットの変更があるか確認
   - 変更がある場合は AskUserQuestion で警告:
     - 「未コミットの変更があります。強制的に削除しますか？」
     - 選択肢: 「はい、強制削除する」「いいえ、キャンセル」
   - 「いいえ」の場合は中断

4. **Docker コンテナを停止**
   - `pnpm docker:down` を実行（エラーは無視）

5. **worktree を削除**
   - 親ディレクトリに移動: `cd ..`
   - worktree を削除: `git worktree remove <現在のディレクトリ名>`
   - 強制削除の場合: `git worktree remove --force <現在のディレクトリ名>`

6. **結果を出力**
   - 削除した worktree のパス
   - 「worktree を削除しました。メインのワークツリーに戻ってください。」
