#!/bin/bash
set -euo pipefail

# 並行開発用の git worktree を新規作成し、ポートが重複しないよう .env.local を設定する

# デフォルトポート
DEFAULT_POSTGRES_PORT=54320
DEFAULT_QSTASH_PORT=8080
DEFAULT_WEB_PORT=3000

# 1. タイムスタンプを生成
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# 2. ポートを計算
WORKTREE_COUNT=$(git worktree list | wc -l | tr -d ' ')
PORT_OFFSET=$((WORKTREE_COUNT + 1))

POSTGRES_PORT=$((DEFAULT_POSTGRES_PORT + PORT_OFFSET))
QSTASH_PORT=$((DEFAULT_QSTASH_PORT + PORT_OFFSET))
WEB_PORT=$((DEFAULT_WEB_PORT + PORT_OFFSET))

# 3. worktree を作成
CURRENT_DIR_NAME=$(basename "$(pwd)")
WORKTREE_DIR="../${CURRENT_DIR_NAME}-${TIMESTAMP}"
BRANCH_NAME="worktree-${TIMESTAMP}"

echo "worktree を作成中..."
echo "  ディレクトリ: ${WORKTREE_DIR}"
echo "  ブランチ: ${BRANCH_NAME}"

git worktree add -b "${BRANCH_NAME}" "${WORKTREE_DIR}" main

# 絶対パスを取得
WORKTREE_ABS_PATH=$(cd "${WORKTREE_DIR}" && pwd)

# 4. ルートの .env.local を作成
cat > "${WORKTREE_ABS_PATH}/.env.local" << EOF
POSTGRES_PORT=${POSTGRES_PORT}
QSTASH_PORT=${QSTASH_PORT}
POSTGRES_URL=postgresql://ponp:ponp@localhost:${POSTGRES_PORT}/ponp
EOF

echo "${WORKTREE_ABS_PATH}/.env.local を作成しました"

# 5. apps/web/.env.local を作成
cat > "${WORKTREE_ABS_PATH}/apps/web/.env.local" << EOF
POSTGRES_URL=postgresql://ponp:ponp@localhost:${POSTGRES_PORT}/ponp
QSTASH_URL=http://localhost:${QSTASH_PORT}
PORT=${WEB_PORT}
EOF

echo "${WORKTREE_ABS_PATH}/apps/web/.env.local を作成しました"

# 6. pnpm install を実行
echo ""
echo "pnpm install を実行中..."
(cd "${WORKTREE_ABS_PATH}" && pnpm install)

# 7. Docker を起動
echo ""
echo "Docker コンテナを起動中..."
(cd "${WORKTREE_ABS_PATH}" && pnpm docker:up)

# 8. WebStorm を起動（オプション）
if command -v webstorm &> /dev/null; then
  echo "WebStorm を起動中..."
  webstorm "${WORKTREE_ABS_PATH}"
fi

# 9. 結果を出力
echo ""
echo "=========================================="
echo "worktree を作成しました"
echo "=========================================="
echo ""
echo "パス:          ${WORKTREE_ABS_PATH}"
echo "ブランチ:      ${BRANCH_NAME}"
echo "POSTGRES_PORT: ${POSTGRES_PORT}"
echo "QSTASH_PORT:   ${QSTASH_PORT}"
echo "WEB_PORT:      ${WEB_PORT}"
