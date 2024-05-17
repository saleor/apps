FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY . .

RUN pnpm install --global turbo

RUN turbo prune app-avatax --docker

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --filter=app-avatax

# RUN pnpm dev --filter=app-avatax
CMD ["pnpm", "dev", "--filter=app-avatax"]
