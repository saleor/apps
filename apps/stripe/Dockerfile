FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Copy root package files for monorepo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./

# Copy all package.json files to preserve workspace structure
COPY packages/ ./packages/
COPY apps/stripe/ ./apps/stripe/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build stage
FROM base AS builder
WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Build-time env vars required by Next.js
ARG SECRET_KEY=build-placeholder
ARG DYNAMODB_MAIN_TABLE_NAME=stripe-main-table
ARG AWS_REGION=localhost
ARG AWS_ACCESS_KEY_ID=local
ARG AWS_SECRET_ACCESS_KEY=local
ARG BASE_PATH=""

ENV SECRET_KEY=${SECRET_KEY}
ENV DYNAMODB_MAIN_TABLE_NAME=${DYNAMODB_MAIN_TABLE_NAME}
ENV AWS_REGION=${AWS_REGION}
ENV AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
ENV AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
ENV BASE_PATH=${BASE_PATH}
ENV NEXT_PUBLIC_BASE_PATH=${BASE_PATH}

COPY --from=deps /app ./

# Create .env file for the stripe app build
RUN echo 'SECRET_KEY=build-placeholder' > /app/apps/stripe/.env && \
    echo 'DYNAMODB_MAIN_TABLE_NAME=stripe-main-table' >> /app/apps/stripe/.env && \
    echo 'AWS_REGION=localhost' >> /app/apps/stripe/.env && \
    echo 'AWS_ACCESS_KEY_ID=local' >> /app/apps/stripe/.env && \
    echo 'AWS_SECRET_ACCESS_KEY=local' >> /app/apps/stripe/.env && \
    echo "BASE_PATH=${BASE_PATH}" >> /app/apps/stripe/.env && \
    echo "NEXT_PUBLIC_BASE_PATH=${BASE_PATH}" >> /app/apps/stripe/.env

# Build the stripe app and its dependencies
# The crypto.randomUUID polyfill is now in _document.tsx as an inline script
# Using --no-lint because our local customizations may conflict with upstream ESLint rules
RUN cd /app/apps/stripe && pnpm next build --no-lint

# Production stage
FROM base AS runner
WORKDIR /app

# Install curl for health checks
# Upgrade base packages to pick up security fixes (e.g., zlib CVE-2026-22184)
RUN apk upgrade --no-cache && apk add --no-cache curl

ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/stripe ./apps/stripe

WORKDIR /app/apps/stripe

# Remove build-time .env file that contains placeholder AWS credentials
# This allows the AWS SDK to use ECS task role credentials at runtime
RUN rm -f .env

USER nextjs

EXPOSE 3001
ENV HOSTNAME=0.0.0.0
ENV PORT=3001

CMD ["sh", "-c", "./node_modules/.bin/next start --port 3001"]
