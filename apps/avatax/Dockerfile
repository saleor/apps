FROM node:22.11-alpine AS builder
RUN apk update
RUN apk add --no-cache libc6-compat git python3 make g++
WORKDIR /app

# Set up PNPM
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm i --global corepack@latest && corepack enable

# Copy the entire repo first to ensure all workspace dependencies are available
COPY . .

# Install dependencies
RUN pnpm install --frozen-lockfile

# Enable Node.js to resolve both ESM and CommonJS modules
ENV NODE_OPTIONS="--experimental-specifier-resolution=node --no-warnings"

# Move to the app directory
WORKDIR /app/apps/avatax

# Build the app with all dependencies available
RUN pnpm build

# Production image
FROM node:22.11-alpine AS runner
WORKDIR /app

# Set up PNPM
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm i --global corepack@latest && corepack enable

# Set to production environment
ENV NODE_ENV=production

# Enable Node.js to resolve both ESM and CommonJS modules
ENV NODE_OPTIONS="--experimental-specifier-resolution=node --no-warnings"

# Copy the entire workspace to ensure all dependencies are available
COPY --from=builder /app ./

# Create an empty .env file to avoid errors (will be overridden by mounted volume)
RUN touch /app/apps/avatax/.env

# Create data directory for APL storage
RUN mkdir -p /app/apps/avatax/data

# Expose the port the app runs on
EXPOSE 3000

# Set the command to run the app
WORKDIR /app/apps/avatax
CMD ["pnpm", "start"]