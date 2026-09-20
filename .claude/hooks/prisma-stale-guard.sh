#!/bin/bash
# Prisma Stale Client Guard — Stop hook
#
# 증상: 페이지가 `Cannot read properties of undefined (reading 'findUnique')`로 죽는다.
# 원인: `prisma generate`가 node_modules의 클라이언트를 다시 만들어도, 실행 중인 dev
#       서버는 시작할 때 require한 옛 모듈을 들고 있다. src/lib/db.ts가 인스턴스를
#       globalThis에 캐시하므로 HMR로도 교체되지 않는다. 프로세스 재시작만이 답이다.
#
# 이 훅은 턴이 끝날 때 "생성된 클라이언트가 dev 서버보다 새것인가"를 보고,
# 그렇다면 그 서버를 재시작한다. 이미 깨진 서버만 건드리므로 되돌릴 것이 없다.

set -u
DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
CLIENT="$DIR/node_modules/.prisma/client/index.js"
[ -f "$CLIENT" ] || exit 0

mtime() { stat -f %m "$1" 2>/dev/null || stat -c %Y "$1" 2>/dev/null; }

# 시작 시각을 epoch로 (macOS는 lstart, 그 외는 /proc)
start_epoch() {
  local lstart
  lstart=$(ps -o lstart= -p "$1" 2>/dev/null) || return 1
  [ -n "$lstart" ] || return 1
  date -j -f "%a %b %e %T %Y" "$lstart" +%s 2>/dev/null ||
    date -d "$lstart" +%s 2>/dev/null
}

CLIENT_AT=$(mtime "$CLIENT")
[ -n "$CLIENT_AT" ] || exit 0

for PID in $(pgrep -f "next-server" 2>/dev/null); do
  # 이 체크아웃에서 띄운 서버만 건드린다 (다른 worktree·프로젝트는 그대로 둔다)
  CWD=$(lsof -a -p "$PID" -d cwd -Fn 2>/dev/null | sed -n 's/^n//p')
  [ "$CWD" = "$DIR" ] || continue

  STARTED=$(start_epoch "$PID") || continue
  [ "$CLIENT_AT" -gt "$STARTED" ] || continue

  # npm run dev → next dev → next-server. 최상위를 죽여야 통째로 내려간다.
  TOP="$PID"
  for _ in 1 2 3; do
    PARENT=$(ps -o ppid= -p "$TOP" 2>/dev/null | tr -d ' ')
    [ -n "$PARENT" ] && [ "$PARENT" != "1" ] || break
    case "$(ps -o command= -p "$PARENT" 2>/dev/null)" in
      *"next dev"*|*"npm run dev"*|*"npm exec"*) TOP="$PARENT" ;;
      *) break ;;
    esac
  done

  PORT=$(lsof -a -nP -p "$PID" -iTCP -sTCP:LISTEN -Fn 2>/dev/null | sed -n 's/.*:\([0-9]*\)$/\1/p' | head -1)
  kill "$TOP" 2>/dev/null
  sleep 2
  (cd "$DIR" && nohup npm run dev > /tmp/van-dev-$$.log 2>&1 &)

  # 턴이 끝나자마자 사용자가 죽은 포트를 만나지 않도록 기동까지 기다린다
  for _ in $(seq 1 30); do
    lsof -t -nP -iTCP:"${PORT:-3000}" -sTCP:LISTEN >/dev/null 2>&1 && break
    sleep 1
  done

  echo "Prisma 클라이언트가 재생성되어 낡은 dev 서버(pid $PID, port ${PORT:-?})를 재시작했습니다." >&2
  echo "재시작하지 않으면 새 모델 접근이 'Cannot read properties of undefined'로 실패합니다." >&2
  exit 0
done

exit 0
