# Saleor Apps

## Project Structure

**Monorepo Architecture**: This is a Turborepo-managed monorepo containing Saleor Apps built with Next.js, TypeScript, and modern development tooling.

- `/apps/` - Individual Saleor applications (AvaTax, CMS, Klaviyo, Products Feed, Search, Segment, SMTP, Stripe, NP Atobarai)
- `/packages/` - Shared libraries and utilities (domain, errors, logger, otel, UI components, etc.)
- `/templates/` - App templates for new development
- Uses PNPM workspaces with workspace dependencies via `workspace:*`

**Domain-Driven Design**: Each app follows modular architecture:

- `src/modules/` - Domain-specific business logic modules
- `src/app/api/` - Next.js App Router API routes (webhooks)
- `src/pages/` - Legacy Pages Router for some apps
- Business logic encapsulated in domain entities and use cases

## Essential Commands

**Development**:

- `pnpm dev` - Start all apps in development mode
- `pnpm --filter <app-name> dev` - Start specific app (e.g., `pnpm --filter saleor-app-avatax dev`)
- `pnpm dev:debug` - Start with debug logging (app-level)

**Building & Type Checking**:

- `pnpm build` - Build all apps and packages
- `pnpm check-types` - Type check all projects
- `tsc --noEmit` - Type check specific app (run in app directory)

**Testing**:

- `pnpm test:ci` - Run unit tests for all projects
- `vitest --project units` - Run unit tests for specific app
- `vitest --project e2e` - Run E2E tests for specific app
- `pnpm e2e` - Run E2E tests (app-level)

**Linting & Formatting**:

- `pnpm lint` - Lint all projects
- `pnpm lint:fix` - Auto-fix linting issues
- `pnpm format` - Format all code with Prettier
- `eslint .` - Lint specific app (run in app directory)

**Code Generation**:

- `pnpm generate` - Generate GraphQL types for all projects
- `pnpm run generate:app` - Generate app-specific GraphQL types
- `pnpm run generate:e2e` - Generate E2E test GraphQL types

## Architecture Patterns

**Result-Based Error Handling**: Uses `neverthrow` library extensively. Functions return `Result<T, E>` instead of throwing exceptions:

- Test success: `result._unsafeUnwrap()`
- Test errors: `result._unsafeUnwrapErr()`

**Branded Types with Zod**: Follow ADR 0002 for type safety on primitives:

```typescript
const saleorApiUrlSchema = z.string().url().endsWith("/graphql/").brand("SaleorApiUrl");
export const createSaleorApiUrl = (raw: string) => saleorApiUrlSchema.parse(raw);
```

**Error Classes**: Use `BaseError.subclass()` pattern from `@saleor/apps-errors`:

```typescript
static ValidationError = BaseError.subclass("ValidationError", {
  props: { _brand: "AppChannelConfig.ValidationError" as const },
});
```

**Repository Pattern**: Data access through repository interfaces, typically backed by DynamoDB via `@saleor/dynamo-config-repository`.

**Use Cases**: Webhook handlers delegate to use case classes that contain business logic. Use cases extend `BaseUseCase` for shared config loading patterns.

## Key Technologies

**Frontend**: Next.js (App Router + Pages Router), React, TypeScript, Macaw UI, React Hook Form with Zod resolvers

**Backend**: tRPC for type-safe API layer, GraphQL with code generation, Webhook handling

**Database**: DynamoDB for configuration storage, repositories for data access

**Testing**: Vitest with workspace configuration, React Testing Library, PactumJS for E2E tests

**Observability**: OpenTelemetry instrumentation, Sentry error tracking, structured logging with contextual loggers

**Tooling**: Turborepo, PNPM workspaces, ESLint with custom configs, Prettier

## Testing Conventions

**Unit Tests**: Located in `src/**/*.test.ts`, use Vitest with jsdom environment
**E2E Tests**: Located in `e2e/**/*.spec.ts`, use PactumJS for API testing
**Setup**: Apps use `src/setup-tests.ts` for unit test setup, `e2e/setup.ts` for E2E setup
**Mocking**: Mock objects in `src/__tests__/mocks/`, use `vi.spyOn()` for method spying

## Integration Points

**Saleor Integration**: Apps receive webhooks at `/api/webhooks/saleor/`, use webhook definitions in `webhooks.ts` for registration

**External APIs**: Payment providers (Stripe, NP Atobarai), tax services (AvaTax), CMS systems, etc. wrapped in domain-specific client classes

**Configuration**: Apps store configuration in DynamoDB, access via repository pattern with app metadata management

## Development Workflow

1. **Environment Setup**: Each app has `.env.example` - copy to `.env.local` with required values
2. **Schema Generation**: Run `pnpm generate` after GraphQL schema changes
3. **Type Safety**: All apps use strict TypeScript - ensure no `any` types
4. **Testing**: Write unit tests alongside features, E2E tests for critical workflows
5. **Linting**: Code must pass ESLint rules including custom app-specific rules like `n/no-process-env`

## App-Specific Notes

- **AvaTax**: Tax calculation service with comprehensive E2E testing suite
- **Stripe**: Payment processing with transaction handling use cases
- **Search**: Algolia integration with webhook-driven product indexing
- **SMTP**: Email service with template management
- **CMS**: Content management system integration with bulk sync capabilities

Run commands from the root directory for global operations, or from individual app directories for app-specific tasks.
