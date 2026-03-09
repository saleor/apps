FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Copy root package files for monorepo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./

# Copy all package.json files to preserve workspace structure
COPY packages/ ./packages/
COPY apps/mtg-import/ ./apps/mtg-import/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS builder
WORKDIR /app

RUN apk add --no-cache openssl

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

ARG BASE_PATH=""
ENV BASE_PATH=${BASE_PATH}
ENV NEXT_PUBLIC_BASE_PATH=${BASE_PATH}

COPY --from=deps /app ./

# Generate Prisma client
RUN cd apps/mtg-import && pnpm prisma generate

RUN echo "BASE_PATH=${BASE_PATH}" > /app/apps/mtg-import/.env && \
    echo "NEXT_PUBLIC_BASE_PATH=${BASE_PATH}" >> /app/apps/mtg-import/.env

ENV SKIP_ENV_VALIDATION=true
RUN pnpm turbo run build --filter=saleor-app-mtg-import

# Production stage
FROM base AS runner
WORKDIR /app

# Upgrade base packages to pick up security fixes (e.g., zlib CVE-2026-22184)
RUN apk upgrade --no-cache && apk add --no-cache curl openssl

ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/packages ./packages
COPY --from=builder --chown=nextjs:nodejs /app/apps/mtg-import ./apps/mtg-import

WORKDIR /app/apps/mtg-import

RUN mkdir -p data && chown nextjs:nodejs data

USER nextjs

EXPOSE 3005
ENV HOSTNAME=0.0.0.0
ENV PORT=3005

CMD ["pnpm", "start"]
