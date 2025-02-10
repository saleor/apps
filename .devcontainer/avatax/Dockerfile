FROM mcr.microsoft.com/devcontainers/typescript-node:22

ENV PNPM_HOME="/home/node/.pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

RUN pnpm install --frozen-lockfile --filter=app-avatax
