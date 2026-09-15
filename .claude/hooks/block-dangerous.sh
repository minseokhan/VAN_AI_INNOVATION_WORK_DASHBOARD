#!/bin/bash
# PreToolUse[Bash] — 위험 명령 차단. stdin의 tool_input.command를 검사한다.
INPUT=$(cat)
CMD=$(printf '%s' "$INPUT" | jq -r '.tool_input.command // empty')
if printf '%s' "$CMD" | grep -qE 'rm\s+-rf|git\s+push\s+--force|git\s+reset\s+--hard|DROP\s+TABLE'; then
  jq -nc '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:"BLOCKED: 위험한 명령어가 감지되었습니다."}}'
fi
exit 0
