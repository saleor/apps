#!/usr/bin/env bash
#
# Setup script for private Saleor apps (git submodules)
#
# This script helps developers initialize private app submodules that they have access to.
# Apps without access will be gracefully skipped.
#
# Usage:
#   ./scripts/setup-private-apps.sh [--force]
#
# Options:
#   --force    Force update of already initialized submodules
#

set -e -o pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

FORCE_UPDATE=false
if [[ "$1" == "--force" ]]; then
  FORCE_UPDATE=true
fi

echo "🔐 Setting up private Saleor apps..."
echo ""

cd "${ROOT_DIR}"

# Read .gitmodules and extract private app submodules
PRIVATE_APPS=$(git config --file .gitmodules --get-regexp path | grep "apps/" | awk '{print $2}' || true)

if [[ -z "${PRIVATE_APPS}" ]]; then
  echo "✅ No private apps configured in .gitmodules"
  exit 0
fi

SUCCESS_COUNT=0
SKIP_COUNT=0
FAIL_COUNT=0

for APP_PATH in ${PRIVATE_APPS}; do
  APP_NAME=$(basename "${APP_PATH}")
  APP_URL=$(git config --file .gitmodules "submodule.${APP_PATH}.url")

  echo "📦 Processing: ${APP_NAME}"
  echo "   Path: ${APP_PATH}"
  echo "   Repository: ${APP_URL}"

  # Check if already initialized
  if [[ -f "${APP_PATH}/.git" ]] || [[ -d "${APP_PATH}/.git" ]]; then
    if [[ "${FORCE_UPDATE}" == "true" ]]; then
      echo "   🔄 Updating existing submodule..."
      if git submodule update --remote "${APP_PATH}" 2>/dev/null; then
        echo "   ✅ Updated successfully"
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
      else
        echo "   ⚠️  Update failed (this is expected if you don't have access)"
        SKIP_COUNT=$((SKIP_COUNT + 1))
      fi
    else
      echo "   ⏭️  Already initialized (use --force to update)"
      SKIP_COUNT=$((SKIP_COUNT + 1))
    fi
  else
    echo "   🔄 Initializing submodule..."
    # Try to initialize the submodule
    if git submodule update --init --recursive "${APP_PATH}" 2>/dev/null; then
      echo "   ✅ Initialized successfully"
      SUCCESS_COUNT=$((SUCCESS_COUNT + 1))

      # Install dependencies for the newly initialized app
      if [[ -f "${APP_PATH}/package.json" ]]; then
        echo "   📥 Installing dependencies..."
        pnpm install
      fi
    else
      echo "   ⚠️  Initialization failed (this is expected if you don't have access)"
      echo "   ℹ️  If you should have access, check your GitHub authentication:"
      echo "       - SSH: Ensure your SSH key is added to GitHub"
      echo "       - HTTPS: Ensure you have a valid GitHub token"
      FAIL_COUNT=$((FAIL_COUNT + 1))
    fi
  fi

  echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Summary:"
echo "   ✅ Successfully initialized/updated: ${SUCCESS_COUNT}"
echo "   ⏭️  Skipped: ${SKIP_COUNT}"
echo "   ⚠️  No access or failed: ${FAIL_COUNT}"
echo ""

if [[ ${SUCCESS_COUNT} -gt 0 ]]; then
  echo "✨ Private apps are ready! You can now develop with them."
  echo ""
  echo "💡 Tip: Run 'pnpm dev' to start all available apps"
elif [[ ${FAIL_COUNT} -gt 0 ]]; then
  echo "ℹ️  Some private apps are not available. This is normal if you don't have access."
  echo "   The monorepo will work fine with only the public apps."
else
  echo "ℹ️  No new private apps were initialized."
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
