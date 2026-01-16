#!/bin/bash
set -euo pipefail

# 現在のディレクトリの git worktree を削除し、ディレクトリも削除する

# 1. worktree かどうか確認
CURRENT_DIR=$(pwd)
MAIN_WORKTREE=$(git worktree list | head -n 1 | awk '{print $1}')

if [ "${CURRENT_DIR}" = "${MAIN_WORKTREE}" ]; then
  echo "エラー: メインのワークツリーは削除できません"
  exit 1
fi

# 2. 対話形式で確認
echo "現在の worktree: ${CURRENT_DIR}"
read -p "この worktree を削除してもよいですか？ (y/N): " CONFIRM
if [ "${CONFIRM}" != "y" ] && [ "${CONFIRM}" != "Y" ]; then
  echo "キャンセルしました"
  exit 0
fi

# 3. 未コミットの変更を確認
if [ -n "$(git status --porcelain)" ]; then
  echo ""
  echo "警告: 未コミットの変更があります"
  git status --short
  echo ""
  read -p "強制的に削除しますか？ (y/N): " FORCE_CONFIRM
  if [ "${FORCE_CONFIRM}" != "y" ] && [ "${FORCE_CONFIRM}" != "Y" ]; then
    echo "キャンセルしました"
    exit 0
  fi
fi

# 4. Docker コンテナを停止
echo ""
echo "Docker コンテナを停止中..."
pnpm docker:down || true

# 5. ディレクトリを削除
WORKTREE_PATH="${CURRENT_DIR}"
cd ..
echo "worktree を削除中..."
rm -rf "${WORKTREE_PATH}"

# 6. メイン worktree で prune を実行
echo "git worktree prune を実行中..."
(cd "${MAIN_WORKTREE}" && git worktree prune)

# 7. 結果を出力
echo ""
echo "=========================================="
echo "worktree を削除しました"
echo "=========================================="
echo ""
echo "削除したパス: ${WORKTREE_PATH}"
echo ""
echo "メインのワークツリーに戻ってください:"
echo "  cd ${MAIN_WORKTREE}"
