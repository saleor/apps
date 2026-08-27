# Saleor Apps

## Project Structure

**Monorepo Architecture**: This is a Turborepo-managed monorepo containing Saleor Apps built with Next.js, TypeScript, and modern development tooling.

- `/apps/` - Individual Saleor applications - see [Directory Map](#directory-map-where-to-look) to pick the right one
- `/packages/` - Shared libraries and utilities - see [Directory Map](#directory-map-where-to-look)
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
6. **Changeset**: Functional changes, like new features or fixes should have changeset attached. Do not attach it if code changes do not have visible impact to the user, like refactor. To run changeset: 
    - Execute `pnpm changeset add` from root directory
    - Select affected app(s) or package(s)
    - If many changes applied in single commit, create multiple changesets
    - Ensure changeset has a good value, describing what was the actual change. It should be less technical than the commit. Best if it has before/after described.

## Directory Map (where to look)

Requests often name a vendor, protocol or feature instead of a directory. Match the keyword to the
directory below before searching the whole repo.

### Apps

| Directory                | Package name                     | Keywords                                                                                                                       |
| ------------------------ | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `apps/anonymizer`        | `saleor-app-anonymizer`          | anonymize, GDPR, PII, customer data scrubbing                                                                                    |
| `apps/avatax`            | `saleor-app-avatax`              | AvaTax, Avalara, tax, tax calculation, tax codes, address validation, `CALCULATE_TAXES`, ORDER_CONFIRMED taxes, entity use code   |
| `apps/cms`               | `saleor-app-cms`                 | CMS, Contentful, DatoCMS, Strapi, Builder.io, Payload CMS, product sync to CMS, bulk sync, field mapping                          |
| `apps/dummy-payment-app` | `saleor-app-payment-dummy`       | dummy payment, test payment gateway, transaction flow sandbox                                                                    |
| `apps/extensions-explorer` | `saleor-app-extensions-explorer` | extensions explorer, Dashboard extensions playground, manifest builder, extension mounts/targets, placeholder extensions |
| `apps/klaviyo`           | `saleor-app-klaviyo`             | Klaviyo, marketing events, customer events                                                                                       |
| `apps/np-atobarai`       | `saleor-app-payment-np-atobarai` | NP Atobarai, Net Protections, Japan, deferred payment, zip code lookup, 後払い                                                     |
| `apps/onboarding`        | `saleor-app-onboarding`          | onboarding, welcome widget, Dashboard home page widget                                                                           |
| `apps/products-feed`     | `saleor-app-products-feed`       | Google Merchant Center, product feed, XML feed, S3 upload, feed template, Handlebars feed attributes                              |
| `apps/search`            | `saleor-app-search`              | Algolia, search, indexing, index products, `algoliasearch`, webhook-driven product indexing                                      |
| `apps/segment`           | `saleor-app-segment`             | Segment, Twilio Segment, analytics tracking, track events                                                                        |
| `apps/smtp`              | `saleor-app-smtp`                | SMTP, email, nodemailer, MJML, email templates, Monaco editor, notification emails, sendgrid-era templates                        |
| `apps/stripe`            | `saleor-app-payment-stripe`      | Stripe, payment, payment intent, checkout session, refund, transaction, `TRANSACTION_*` webhooks, Stripe webhook signature        |

### Packages

| Directory                          | Package name                      | Keywords                                                                       |
| ---------------------------------- | --------------------------------- | ------------------------------------------------------------------------------ |
| `packages/app-problems`            | `@saleor/app-problems`            | app problems, health checks, version compatibility, semver checks               |
| `packages/domain`                  | `@saleor/apps-domain`             | branded types, `SaleorApiUrl`, `AppId`, shared value objects                    |
| `packages/dynamo-config-repository` | `@saleor/dynamo-config-repository` | DynamoDB, config repository, entity mapping, `dynamodb-toolbox`               |
| `packages/errors`                  | `@saleor/errors`                  | `BaseError`, `BaseError.subclass`, error classes, modern-errors                 |
| `packages/eslint-config`           | `@saleor/eslint-config-apps`      | ESLint rules, lint config                                                       |
| `packages/handlebars`              | `@saleor/handlebars`              | Handlebars, template compilation, template helpers                              |
| `packages/logger`                  | `@saleor/apps-logger`             | logger, tslog, structured logging, log context                                  |
| `packages/otel`                    | `@saleor/apps-otel`               | OpenTelemetry, traces, metrics, spans, instrumentation, OTLP exporter           |
| `packages/react-hook-form-macaw`   | `@saleor/react-hook-form-macaw`   | form inputs, React Hook Form + Macaw bindings                                   |
| `packages/sentry-utils`            | `@saleor/sentry-utils`            | Sentry, error reporting, exception capture                                      |
| `packages/shared`                  | `@saleor/apps-shared`             | urql client, auth exchange, misc shared helpers                                 |
| `packages/trpc`                    | `@saleor/apps-trpc`               | tRPC setup, protected procedures, context, middleware                           |
| `packages/typescript-config`       | `@saleor/typescript-config-apps`  | tsconfig, compiler options                                                      |
| `packages/ui`                      | `@saleor/apps-ui`                 | shared React components, Macaw UI wrappers, layout                              |
| `packages/webhook-utils`           | `@saleor/webhook-utils`           | webhook migration, webhook registration, webhook manager                        |

If a request names a vendor not listed here, grep `apps/*/package.json` for the dependency first.

Run commands from the root directory for global operations, or from individual app directories for app-specific tasks.
