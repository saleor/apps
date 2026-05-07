FROM node:20.12-alpine
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY . .

RUN pnpm install --frozen-lockfile

CMD pnpm dev 
