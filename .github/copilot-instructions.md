# Saleor Apps Copilot Instructions

This repository contains a monorepo of Saleor Apps using Next.js, TypeScript, and a modern development stack with specific architectural patterns.

## Architecture Overview

**Monorepo Structure**: Apps are in `/apps/`, shared packages in `/packages/`, using PNPM workspaces and Turborepo for build orchestration.

**Domain-Driven Design**: Each app follows a modules-based structure (`src/modules/`) with domain boundaries like `app-config/`, `atobarai/`, `saleor/`, etc. Business logic is encapsulated in domain entities and use cases.

**Result-Based Error Handling**: Uses `neverthrow` library extensively. Functions return `Result<T, E>` instead of throwing exceptions. Test with with `._unsafeUnwrap()/_unsafeUnwrapErr()`.

**Branded Types with Zod**: Follow ADR 0002 - use Zod branded types for type safety on primitives:

```typescript
const saleorApiUrlSchema = z.string().url().endsWith("/graphql/").brand("SaleorApiUrl");
export const createSaleorApiUrl = (raw: string) => saleorApiUrlSchema.parse(raw);
```

## Key Development Patterns

**App Structure**: Next.js App Router in `/src/app/api/` for webhooks, `/src/modules/` for business logic, `/src/__tests__/mocks/` for test fixtures.

**Error Classes**: Use `BaseError.subclass()` pattern for custom errors with metadata:

```typescript
static ValidationError = BaseError.subclass("ValidationError", {
  props: { _brand: "AppChannelConfig.ValidationError" as const },
});
```

**Use Cases**: Webhook handlers delegate to use case classes that contain business logic. Use cases extend `BaseUseCase` for shared config loading patterns.

**Repository Pattern**: Data access through repository interfaces, typically backed by DynamoDB via `@saleor/dynamo-config-repository`.

## Essential Commands

**Development**: `pnpm dev` (root) starts all apps, `pnpm --filter <app-name> dev` for single app
**Testing**: `pnpm test` (root), `npm run test:unit` (app-level), use `vitest --project=unit` for targeting
**Type Checking**: `pnpm check-types` (root), `tsc --noEmit` (app-level)
**Linting**: `pnpm lint` (root), `npx eslint .` (app-level)

## Testing Conventions

**Vitest Configuration**: Apps use workspace config with unit tests in `src/**/*.test.ts`, setup in `src/__tests__/setup.ts`. Vitest runs in watch mode by default.

**Mocking Patterns**: Mock objects in `src/__tests__/mocks/`, use `vi.spyOn()` for method spying and mocking.

**neverthrow Testing**: Use `._unsafeUnwrap()` for success cases and `._unsafeUnwrapErr()` for error cases in assertions.

## Integration Points

**Saleor Webhooks**: Apps receive webhooks at `/api/webhooks/saleor/`, use webhook definitions for registration, implement verification middleware.

**External APIs**: Payment providers (Stripe, NP Atobarai), tax services (AvaTax), etc. wrapped in domain-specific client classes.

**Observability**: OpenTelemetry instrumentation, Sentry error tracking, structured logging with contextual loggers.

**State Management**: tRPC for type-safe API layer, React Hook Form with Zod resolvers for forms, configuration stored in DynamoDB.

Focus on the Result pattern for error handling, domain modeling with branded types, and the modular architecture when contributing.
