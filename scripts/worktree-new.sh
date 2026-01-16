#!/bin/bash
set -euo pipefail

# 並行開発用の git worktree を新規作成し、ポートが重複しないよう .env.local を設定する

# デフォルトポート
DEFAULT_POSTGRES_PORT=54320
DEFAULT_QSTASH_PORT=8080
DEFAULT_WEB_PORT=3000

# 現在のディレクトリ名を取得
CURRENT_DIR_NAME=$(basename "$(pwd)")

# 1. 既存ワークツリーをリスト表示
echo "既存のワークツリー:"
git worktree list
echo ""

# 2. 未使用の最小番号 n を決定
# 既存ワークツリーから _worktree_ 形式の番号を抽出
USED_NUMBERS=$(git worktree list | grep -o "_worktree_[0-9]\+" | grep -o "[0-9]\+" | sort -n || true)

# 1から順に未使用の番号を探す
N=1
while true; do
  if ! echo "${USED_NUMBERS}" | grep -qx "${N}"; then
    break
  fi
  N=$((N + 1))
done

echo "使用する番号: ${N}"

# 3. ポート番号を計算 (デフォルト + n)
POSTGRES_PORT=$((DEFAULT_POSTGRES_PORT + N))
QSTASH_PORT=$((DEFAULT_QSTASH_PORT + N))
WEB_PORT=$((DEFAULT_WEB_PORT + N))

echo "ポート番号:"
echo "  POSTGRES_PORT: ${POSTGRES_PORT}"
echo "  QSTASH_PORT:   ${QSTASH_PORT}"
echo "  WEB_PORT:      ${WEB_PORT}"
echo ""

# 4. 各ポートの使用状況をチェック
check_port() {
  local port=$1
  local name=$2
  if lsof -i ":${port}" > /dev/null 2>&1; then
    echo "エラー: ポート ${port} (${name}) は既に使用中です"
    return 1
  fi
  return 0
}

PORTS_IN_USE=0
if ! check_port "${POSTGRES_PORT}" "POSTGRES_PORT"; then
  PORTS_IN_USE=1
fi
if ! check_port "${QSTASH_PORT}" "QSTASH_PORT"; then
  PORTS_IN_USE=1
fi
if ! check_port "${WEB_PORT}" "WEB_PORT"; then
  PORTS_IN_USE=1
fi

if [ "${PORTS_IN_USE}" -eq 1 ]; then
  echo ""
  echo "ポートが使用中のため、worktree を作成できません。"
  echo "使用中のポートを解放するか、該当する worktree を閉じてください。"
  exit 1
fi

echo "すべてのポートが利用可能です"
echo ""

# 5. worktree を作成
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
WORKTREE_DIR="../${CURRENT_DIR_NAME}_worktree_${N}"
BRANCH_NAME="main_${TIMESTAMP}"

# ディレクトリが既に存在する場合は確認
if [ -d "${WORKTREE_DIR}" ]; then
  echo "警告: ディレクトリ ${WORKTREE_DIR} は既に存在します。"
  read -p "削除して続行しますか？ (y/N): " answer
  if [ "${answer}" = "y" ] || [ "${answer}" = "Y" ]; then
    echo "ディレクトリを削除中..."
    rm -rf "${WORKTREE_DIR}"
  else
    echo "中止しました。"
    exit 1
  fi
fi

echo "worktree を作成中..."
echo "  ディレクトリ: ${WORKTREE_DIR}"
echo "  ブランチ: ${BRANCH_NAME}"

git worktree add -b "${BRANCH_NAME}" "${WORKTREE_DIR}" main

# 絶対パスを取得
WORKTREE_ABS_PATH=$(cd "${WORKTREE_DIR}" && pwd)

# 6. ルートの .env.local を作成
cat > "${WORKTREE_ABS_PATH}/.env.local" << EOF
POSTGRES_PORT=${POSTGRES_PORT}
QSTASH_PORT=${QSTASH_PORT}
POSTGRES_URL=postgresql://ponp:ponp@localhost:${POSTGRES_PORT}/ponp
EOF

echo "${WORKTREE_ABS_PATH}/.env.local を作成しました"

# 7. apps/web/.env.local を作成
cat > "${WORKTREE_ABS_PATH}/apps/web/.env.local" << EOF
POSTGRES_URL=postgresql://ponp:ponp@localhost:${POSTGRES_PORT}/ponp
QSTASH_URL=http://localhost:${QSTASH_PORT}
PORT=${WEB_PORT}
EOF

echo "${WORKTREE_ABS_PATH}/apps/web/.env.local を作成しました"

# 8. pnpm install を実行
echo ""
echo "pnpm install を実行中..."
(cd "${WORKTREE_ABS_PATH}" && pnpm install)

# 9. Docker を起動
echo ""
echo "Docker コンテナを起動中..."
(cd "${WORKTREE_ABS_PATH}" && pnpm docker:up)

# 10. WebStorm を起動（オプション）
if command -v webstorm &> /dev/null; then
  echo "WebStorm を起動中..."
  webstorm "${WORKTREE_ABS_PATH}"
fi

# 11. 結果を出力
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
