FROM mcr.microsoft.com/devcontainers/typescript-node:22

ENV PNPM_HOME="/home/node/.pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# This is needed so pnpm-store volume is created with correct permissions (see docker-compose.yml)
RUN mkdir -p /app/.pnpm-store
RUN chown -R node:node /app/.pnpm-store

RUN pnpm install --frozen-lockfile --filter=saleor-app-klaviyo
