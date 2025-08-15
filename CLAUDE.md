# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a **monorepo of Saleor Apps** - Next.js applications that extend Saleor (headless e-commerce platform) with integrations for payment processing, tax calculation, CMS, marketing, and other third-party services.

## Essential Commands

### Development
```bash
pnpm dev                           # Start all apps in development mode
pnpm --filter <app-name> dev       # Start specific app (e.g., pnpm --filter stripe dev)
```

### Building
```bash
pnpm build                         # Build all apps
turbo run build                    # Build with Turborepo caching
```

### Testing
```bash
pnpm test                          # Run all tests
pnpm test:ci                       # Run tests in CI mode
vitest --project=unit              # Run unit tests only
vitest --project=e2e               # Run E2E tests only
npm run test:unit                  # Run unit tests in specific app directory
```

### Code Quality
```bash
pnpm lint                          # Run ESLint across all packages
pnpm lint:fix                      # Auto-fix linting issues
pnpm check-types                   # TypeScript type checking across monorepo
tsc --noEmit                       # Type check in specific app directory
pnpm format                        # Prettier formatting
pnpm check-spelling                # Spell checking with cspell
pnpm knip                          # Dead code elimination
```

## Architecture Patterns

### Result-Based Error Handling
Uses `neverthrow` library - functions return `Result<T, E>` instead of throwing exceptions:
```typescript
// In implementation
return ok(data) or err(new CustomError())

// In tests
result._unsafeUnwrap()     // Assert success
result._unsafeUnwrapErr()  // Assert error
```

### Branded Types with Zod
Follow ADR 0002 - use Zod branded types for type-safe primitives:
```typescript
const saleorApiUrlSchema = z.string().url().endsWith("/graphql/").brand("SaleorApiUrl");
export const createSaleorApiUrl = (raw: string) => saleorApiUrlSchema.parse(raw);
```

### Error Classes Pattern
Use `BaseError.subclass()` for custom errors:
```typescript
static ValidationError = BaseError.subclass("ValidationError", {
  props: { _brand: "AppChannelConfig.ValidationError" as const },
});
```

### Domain-Driven Structure
Each app follows modules-based architecture:
- `/src/modules/` - Business logic organized by domain
- `/src/app/api/` - Next.js App Router API routes
- `/src/__tests__/mocks/` - Test fixtures and mocks

### Repository Pattern
Data access through repository interfaces, typically backed by DynamoDB via `@saleor/dynamo-config-repository`.

## Key Technologies

- **Framework**: Next.js 15.2.4 with App Router
- **Language**: TypeScript 5.8.2 with strict mode
- **Package Manager**: PNPM 10.6.3 with workspaces
- **Build System**: Turborepo for monorepo orchestration
- **Testing**: Vitest for unit tests, Playwright for E2E
- **API Layer**: tRPC for type-safe APIs
- **GraphQL**: urql client, GraphQL Code Generator for types
- **Database**: DynamoDB for configuration storage
- **Observability**: OpenTelemetry, Sentry for error tracking
- **UI Components**: @saleor/macaw-ui design system

## Testing Guidelines

- Vitest runs in watch mode by default
- Test files: `src/**/*.test.ts`
- Setup file: `src/__tests__/setup.ts`
- Mock objects in `src/__tests__/mocks/`
- Use `vi.spyOn()` for method mocking
- Test Result types with `._unsafeUnwrap()` and `._unsafeUnwrapErr()`

## Webhook Integration

Apps receive Saleor webhooks at `/api/webhooks/saleor/` endpoints. Each app implements:
- Webhook verification middleware
- Event handlers in use case classes
- Configuration via webhook definitions

## Development Setup

1. Enable Corepack and PNPM:
   ```bash
   npm install --global corepack@latest
   corepack enable pnpm
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up Turborepo remote caching (optional):
   ```bash
   pnpm dlx turbo login
   pnpm dlx turbo link
   ```