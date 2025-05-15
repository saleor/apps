#!/usr/bin/env bash

set -a
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/.env"
set +a

ENDPOINT="$MCP_GRAPHQL_ENDPOINT" HEADERS="{\"Authorization\":\"Bearer $MCP_GRAPHQL_TOKEN\"}" npx mcp-graphql
