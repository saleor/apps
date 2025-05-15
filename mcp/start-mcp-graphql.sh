#!/usr/bin/env bash
set -e

source ./mcp/.env

ENDPOINT=$MCP_GRAPHQL_ENDPOINT HEADERS='{"Authorization":"Bearer $MCP_GRAPHQL_TOKEN"}' npx mcp-graphql
