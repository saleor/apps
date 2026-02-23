# Universal production Dockerfile for all apps
FROM node:22-alpine AS alpine

# Base with pnpm and turbo
FROM alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN pnpm add turbo --global

# Build pruning stage
FROM base AS builder
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app
# Copy entire monorepo
COPY . .
# Scope to a single app (passed via build arg)
ARG APP_NAME
RUN turbo prune --scope=${APP_NAME} --docker

# Install and build stage
FROM base AS installer
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# Copy pruned workspace files
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/out/json/ .

ARG APP_PATH
# Provide default environment variables from .env.example
COPY --from=builder /app/apps/${APP_PATH}/.env.example ./apps/${APP_PATH}/.env

# Set placeholder values for envs
# Write values to .env file
RUN echo "AWS_ACCESS_KEY_ID=placeholder" >> ./apps/${APP_PATH}/.env && \
    echo "AWS_REGION=placeholder" >> ./apps/${APP_PATH}/.env && \
    echo "AWS_SECRET_ACCESS_KEY=placeholder" >> ./apps/${APP_PATH}/.env && \
    echo "DYNAMODB_LOGS_TABLE_NAME=placeholder" >> ./apps/${APP_PATH}/.env && \
    echo "DYNAMODB_MAIN_TABLE_NAME=placeholder" >> ./apps/${APP_PATH}/.env && \
    echo "SECRET_KEY=placeholder" >> ./apps/${APP_PATH}/.env && \
    echo "APL=file" >> ./apps/${APP_PATH}/.env


# Install dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Copy sources and build
COPY --from=builder /app/out/full/ .

# Ensure builds don't fail on APL check at build-time
ENV NODE_ENV=production
ENV APL=file

# Build specific app
ARG APP_NAME
RUN turbo run build --filter=${APP_NAME}

# Runtime image
FROM alpine AS runner
WORKDIR /app

# Security: do not run as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output
ARG APP_PATH
COPY --from=installer --chown=nextjs:nodejs /app/apps/${APP_PATH}/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/${APP_PATH}/.next/static ./apps/${APP_PATH}/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/${APP_PATH}/public ./apps/${APP_PATH}/public

USER nextjs

# Set working directory to app
WORKDIR /app/apps/${APP_PATH}

# Default runtime configuration
EXPOSE 3000
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000


# Start Next standalone server
CMD ["node", "server.js"]