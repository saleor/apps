#!/usr/bin/env bash
# Note: this helper only warns if it can't find the necessary command lines in PATH.
# The agent's role is to then inform the user that workflows couldn't be fully validated
# and the user decides how to proceed (install (and how), or ignore)

set -u -o pipefail

workflow_paths=("$@")

if [ "${#workflow_paths[@]}" -eq 0 ]; then
  workflow_paths=(.github/workflows)
fi

status=0

# actionlint needs `shellcheck` in order to properly work. However, actionlint silently
# skips `shellcheck` checks if not in PATH thus we should warn the user & agent.
if ! command -v shellcheck >/dev/null 2>&1; then
  echo "warning: shellcheck is not in PATH; actionlint cannot analyze shell scripts." >&2
  echo "Install it with: brew install shellcheck" >&2
fi

if command -v actionlint >/dev/null 2>&1; then
  actionlint "${workflow_paths[@]}" || status=1
else
  echo "warning: actionlint is not in PATH; skipping workflow syntax and policy checks" >&2
  echo "Install it with: brew install actionlint" >&2
fi

if command -v zizmor >/dev/null 2>&1; then
  zizmor "${workflow_paths[@]}" || status=1
else
  echo "warning: zizmor is not in PATH; skipping workflow security checks" >&2
  echo "Install it with: brew install zizmor" >&2
fi

exit "$status"
