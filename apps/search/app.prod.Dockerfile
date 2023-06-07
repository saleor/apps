# Source
# https://turbo.build/repo/docs/handbook/deploying-with-docker#example
# TODO https://pnpm.io/cli/fetch

FROM node:18 AS base

FROM base AS builder
#RUN apk add --no-cache libc6-compat
#RUN apk update

# Set working directory
WORKDIR /app

RUN yarn global add turbo@1.9.1
RUN yarn global add pnpm@8.2.0

# Copy entire monorepo
COPY . .

RUN turbo prune --scope="saleor-app-search" --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer

WORKDIR /app
RUN yarn global add pnpm@8.2.0

ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

COPY .gitignore .gitignore
COPY --from=builder /app/out/full/ .
#COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

RUN pnpm install --frozen-lockfile

COPY turbo.json turbo.json

RUN pnpm turbo run build:app --filter="saleor-app-search"

FROM base AS runner
WORKDIR /app

ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=installer /app/apps/search/next.config.js .
COPY --from=installer /app/apps/search/package.json .

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /app/apps/search/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/search/.next/static ./apps/search/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/search/public ./apps/search/public
COPY --from=installer --chown=nextjs:nodejs /app/apps/search/prisma ./apps/search/prisma


CMD ["node", "apps/search/server.js"]

# TODO Another entrypoint for worker