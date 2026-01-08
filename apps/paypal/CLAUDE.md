# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Saleor PayPal Payment App

This is a Next.js-based Saleor payment application that integrates PayPal as a payment provider. It handles payment transactions, refunds, and merchant onboarding through Saleor's payment gateway webhooks.

## Essential Commands

**Development**:
- `pnpm dev` - Start development server with inspector on port 3000
- `pnpm build` - Build the application
- `pnpm check-types` or `tsc` - Type check the codebase
- `pnpm start` - Start production server

**Testing**:
- `pnpm test` or `pnpm test:unit` - Run unit tests (uses vitest workspace "unit")
- `vitest --project=unit` - Run unit tests with watch mode
- `pnpm test:integration` or `vitest --project=integration` - Run integration tests
- `pnpm test:e2e` - Run Playwright E2E tests
- `pnpm test:e2e-ui` - Run Playwright tests with UI
- `pnpm test:ci` - Run unit tests with coverage

**Code Generation**:
- `pnpm generate` - Generate all types (GraphQL + webhook types)
- `pnpm generate:app-graphql-types` - Generate GraphQL types using graphql-codegen
- `pnpm generate:app-webhooks-types` - Generate webhook payload types
- `pnpm generate:e2e-graphql-types` - Generate E2E test GraphQL types

**Database & Migration**:
- `pnpm migrate:database` - Run database migrations (PostgreSQL schema setup)
- `pnpm migrate` - Run webhook migrations
- `pnpm migrate:dry-run` - Dry run webhook migrations

**Linting & Formatting**:
- `pnpm lint` - Lint the codebase
- `pnpm lint:fix` - Auto-fix linting issues

**Other**:
- `pnpm fetch-schema` - Fetch latest Saleor GraphQL schema (version 3.21)
- `pnpm deploy` - Deploy the app

## Architecture Overview

**Modular Domain-Driven Design**: Business logic is organized into domain modules under `src/modules/`:

- **app-config** - Application configuration management, channel mappings
  - `domain/` - PayPal configuration domain entities
  - `repositories/` - Data access layer for configurations
  - `trpc-handlers/` - tRPC endpoints for config management

- **paypal** - PayPal API integration and client management
  - `configuration/` - PayPal config repository and metadata management
  - Core PayPal API clients:
    - `paypal-orders-api.ts` - Create, capture, authorize, get orders
    - `paypal-refunds-api.ts` - Process refunds
    - `paypal-client.ts` - Base HTTP client with OAuth, Auth Assertion, BN Code headers
    - `paypal-oauth-token-cache.ts` - Global OAuth token caching to reduce API calls
  - `partner-referrals/` - Merchant onboarding APIs
    - `paypal-partner-referrals-api.ts` - Create referrals, get seller status, check readiness
    - `partner-referral-builder.ts` - Builder pattern for creating referral requests
    - Supports: PPCP, Payment Methods, Apple Pay, Google Pay, Advanced Vaulting
  - Branded types: `PayPalClientId`, `PayPalClientSecret`, `PayPalOrderId`, `PayPalRefundId`, `PayPalEnv`, `PayPalMerchantId`, `PayPalPartnerReferralId`

- **merchant-onboarding** - Merchant onboarding workflow and state management
  - `merchant-onboarding-repository.ts` - Handles merchant onboarding data
  - `trpc-handlers/` - API endpoints for onboarding process

- **wsm-admin** - Global PayPal configuration for WSM administrators
  - `global-paypal-config.ts` - Domain entity for global configs
  - `global-paypal-config-repository.ts` - Repository pattern implementation
  - `global-paypal-config-cache.ts` - Caching layer for performance

- **saleor** - Saleor-specific integration code (API URL handling, money conversion)

- **transaction-result** - Transaction result types (success, failure, cancel, action-required)

- **trpc** - tRPC router configuration (`trpc-router.ts`, `trpc-server.ts`)

- **ui** - React components for configuration UI

**Webhook Architecture**: Uses Next.js App Router for webhook endpoints at `src/app/api/webhooks/saleor/`:
- `payment-gateway-initialize-session/` - Initialize payment gateway session
- `transaction-initialize-session/` - Initialize transaction session
- `transaction-process-session/` - Process transaction (capture/authorize)
- `transaction-charge-requested/` - Handle charge requests
- `transaction-refund-requested/` - Handle refund requests
- `transaction-cancelation-requested/` - Handle cancellation requests

Each webhook endpoint follows the pattern:
```
webhook-name/
  ├── route.ts           # Next.js route handler (POST export)
  ├── use-case.ts        # Business logic (UseCase class)
  ├── use-case-response.ts  # Response types
  └── webhook-definition.ts  # Webhook metadata
```

**UseCase Pattern**: Webhook handlers delegate to UseCase classes that encapsulate business logic:
- UseCases receive dependencies via constructor injection
- Execute method returns `Result<T, E>` from neverthrow
- UseCases interact with repositories and external APIs (PayPal)

**Repository Pattern**: Data access through repository interfaces:
- `AppConfigRepo` - Channel and PayPal configuration storage
- `PayPalConfigRepo` - PayPal credentials and settings (uses Saleor metadata)
- `MerchantOnboardingRepository` - Merchant onboarding state
- `GlobalPayPalConfigRepository` - WSM admin global configurations
- Implementation uses `@saleor/pg-config-repository` backed by PostgreSQL

**Result-Based Error Handling**: Functions return `Result<T, E>` from neverthrow instead of throwing:
```typescript
const result = await someOperation();
if (result.isErr()) {
  return err(new ErrorResponse(result.error));
}
const value = result.value;
```

**Branded Types with Zod**: Type-safe primitives using Zod brand:
```typescript
// See modules like paypal-client-id.ts, paypal-client-secret.ts
const clientId = createPayPalClientId(rawString); // Validates and brands the type
```

## Key Technologies

- **Next.js 15** - App Router for webhooks, Pages Router for UI
- **TypeScript** - Strict mode enabled
- **tRPC** - Type-safe API layer between frontend and backend
- **PostgreSQL** - Configuration storage via `@saleor/pg-config-repository`
- **Vitest** - Unit and integration testing (workspace-based configuration)
- **Playwright** - E2E testing
- **neverthrow** - Result-based error handling
- **Zod** - Schema validation and branded types
- **React Hook Form** - Form handling with `@hookform/resolvers` and Zod
- **OpenTelemetry** - Observability and tracing
- **Sentry** - Error tracking and monitoring
- **PayPal SDK** - Payment processing via custom client wrappers

## Testing Configuration

**Vitest Workspaces** (configured in `vitest.config.ts`):

1. **Unit Tests** (workspace: "unit"):
   - Pattern: `src/**/*.test.ts` (excluding `src/__tests__/integration/**`)
   - Setup: `./src/__tests__/setup.units.ts`
   - Environment: jsdom
   - Runs with shuffled sequence

2. **Integration Tests** (workspace: "integration"):
   - Pattern: `src/__tests__/integration/**/*.test.ts`
   - Setup: `./src/__tests__/integration/setup.integration.ts`
   - Global setup: `./src/__tests__/integration/global-setup.integration.ts`
   - Single-threaded to avoid PostgreSQL connection conflicts
   - Uses `.env` file loaded via `loadEnv`

**E2E Tests**:
- Framework: Playwright (`@playwright/test`)
- Commands: `pnpm test:e2e` or `pnpm test:e2e-ui`

## Environment Setup

1. Copy `.env.example` to `.env.local` or `.env`
2. Required environment variables (see `src/lib/env.ts` for full list):
   - `SECRET_KEY` - AES-256-CBC encryption key (32 bytes hex, generate with `openssl rand -hex 32`)
   - `ALLOWED_DOMAIN_PATTERN` - Regex pattern for allowed Saleor domains (default: `/*/`)

3. Database configuration (PostgreSQL for APL and config storage):
   - `APL=postgres` - Use PostgreSQL for APL storage (default: `file`)
   - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

4. Optional variables:
   - `APP_LOG_LEVEL` - Log level: "fatal" | "error" | "warn" | "info" | "debug" | "trace" (default: "info")
   - `APP_IFRAME_BASE_URL` - For local development with Docker
   - `APP_API_BASE_URL` - For local development with Docker
   - `MANIFEST_APP_ID` - App identifier (default: "saleor.app.payment.paypal")
   - `OTEL_ENABLED`, `OTEL_ACCESS_TOKEN`, `OTEL_SERVICE_NAME` - OpenTelemetry config
   - Sentry: `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`

## Important Patterns & Conventions

**Error Handling**: Use `BaseError.subclass()` from `@saleor/errors`:
```typescript
static ValidationError = BaseError.subclass("ValidationError", {
  props: { _brand: "ClassName.ValidationError" as const },
});
```

**Webhook Response Types**: Located at `src/app/api/webhooks/saleor/saleor-webhook-responses.ts`:
- `AppIsNotConfiguredResponse` - PayPal config missing for channel
- `BrokenAppResponse` - Internal app errors
- `MalformedRequestResponse` - Invalid request data
- `UnhandledErrorResponse` - Unexpected exceptions

**Logging**: Use contextual loggers via `createLogger()` from `src/lib/logger.ts`:
```typescript
const logger = createLogger("ModuleName");
logger.info("Message", { contextData });
```

**Observability**: Webhooks use `withSpanAttributesAppRouter` and `withLoggerContext` middleware via `compose()`.

**Database Schema**: PostgreSQL table `saleor_app_configuration` stores:
- APL authentication data (tenant/app credentials)
- PayPal configurations as JSONB
- Channel mappings

Run `pnpm migrate:database` to initialize schema.

**GraphQL Schema**: Targets Saleor 3.21. Regenerate types after schema changes with `pnpm generate`.

## Development Workflow

1. **Setup**: Install dependencies from monorepo root, configure `.env.local`
2. **Run Database Migrations**: `pnpm migrate:database` (if using PostgreSQL)
3. **Start Dev Server**: `pnpm dev` (runs on http://localhost:3000 with inspector)
4. **Generate Types**: After GraphQL schema or webhook changes, run `pnpm generate`
5. **Run Tests**: Use `vitest --project=unit` for unit tests during development
6. **Type Checking**: Run `tsc` or `pnpm check-types` frequently
7. **Linting**: Fix issues with `pnpm lint:fix`

## PayPal-Specific Integration Details

### PayPal API Clients
All PayPal API clients are built on top of `PayPalClient` which provides:
- **OAuth 2.0 Authentication** - Automatic token acquisition and refresh
- **Token Caching** - Global cache (`paypalOAuthTokenCache`) to reduce API calls
- **PayPal-Auth-Assertion Header** - JWT header for partner-managed merchant context
  - Format: `base64({"alg":"none"}).base64({"iss":"partner_client_id","payer_id":"merchant_id"}).`
  - Prefers `merchantId` over `merchantEmail` for proper partner fee collection
- **PayPal-Partner-Attribution-Id Header** - BN code for transaction tracking
- **Request/Response Logging** - Full debug logging with timestamps and response times
- **Error Handling** - Structured PayPal API errors with status codes

### Merchant Onboarding Flow
1. **Create Partner Referral** (`POST /v2/customer/partner-referrals`)
   - Use `PartnerReferralBuilder.createDefault()` for recommended settings
   - Includes: PPCP, PAYMENT_METHODS, APPLE_PAY, GOOGLE_PAY, ADVANCED_VAULTING
   - Features: `["PAYMENT", "REFUND"]`
   - Returns action URL for seller onboarding

2. **Track Onboarding Status** (`GET /v1/customer/partners/{partner_merchant_id}/merchant-integrations/{merchant_id}`)
   - Check flags: `PRIMARY_EMAIL_CONFIRMED`, `PAYMENTS_RECEIVABLE`, `OAUTH_INTEGRATIONS`
   - Verify products: `PPCP_CUSTOM`, `PAYMENT_METHODS`, `ADVANCED_VAULTING`
   - Verify capabilities: `CUSTOM_CARD_PROCESSING`, `APPLE_PAY`, `GOOGLE_PAY`, `PAYPAL_WALLET_VAULTING_ADVANCED`

3. **Payment Method Readiness**
   - `checkPaymentMethodReadiness()` analyzes seller status and returns which payment methods are enabled
   - PayPal Buttons: `PPCP_CUSTOM` subscribed
   - Card Processing: `PPCP_CUSTOM` subscribed + `CUSTOM_CARD_PROCESSING` active (no limits)
   - Apple Pay: `PPCP_CUSTOM` subscribed + `APPLE_PAY` capability active
   - Google Pay: `PPCP_CUSTOM` subscribed + `GOOGLE_PAY` capability active
   - Vaulting: `ADVANCED_VAULTING` subscribed + `PAYPAL_WALLET_VAULTING_ADVANCED` active with required scopes

### Apple Pay Domain Registration
- `registerApplePayDomain()` - `POST /v1/customer/wallet-domains`
- `getApplePayDomains()` - `GET /v1/customer/wallet-domains`
- `deleteApplePayDomain()` - `POST /v1/customer/unregister-wallet-domain`
- Requires `PayPal-Auth-Assertion` header for merchant context
- BN code is skipped for domain operations

### Caching Strategy
- **OAuth Tokens** - Cached globally in-memory with automatic expiration (default: 9 hours)
- **PayPal Configurations** - Cached per merchant in `GlobalPayPalConfigCache` to reduce DB queries
- Recent commits show caching improvements for better performance

## Common Integration Points

**PayPal API**: Wrapped in domain-specific clients:
- `PayPalOrdersApi` - Create, capture, authorize orders with line items, platform fees, amount breakdowns
- `PayPalRefundsApi` - Process refunds using capture IDs
- `PayPalPartnerReferralsApi` - Merchant onboarding and status checking
- Factory pattern via `PayPalOrdersApiFactory`, `PayPalRefundsApiFactory`, `PayPalPartnerReferralsApiFactory`

**Saleor Integration**:
- Receives webhooks at `/api/webhooks/saleor/*`
- Uses `@saleor/app-sdk` for authentication and APL
- GraphQL client via `urql` (see `src/lib/graphql-client.ts`)
- Metadata storage via `PayPalMetadataManager`

**tRPC API**: Frontend-backend communication via tRPC routers:
- Main router: `src/modules/trpc/trpc-router.ts`
- Endpoint: `/api/trpc/[trpc]`
- Routers organized by domain module:
  - `appConfig` - PayPal configuration management
  - `merchantOnboarding` - Seller onboarding flow
  - `wsmAdmin` - Global PayPal settings for WSM administrators

## PayPal API Best Practices

### Required Headers
1. **PayPal-Partner-Attribution-Id** - BN code (currently "bnCode", should be provided by PayPal)
2. **PayPal-Auth-Assertion** - JWT for merchant context (when making API calls on behalf of merchants)
3. **Authorization** - Bearer token from OAuth 2.0

### Error Handling
- All PayPal API operations return `Result<T, PayPalApiError>`
- Errors include: statusCode, paypalErrorName, paypalErrorMessage, cause
- Use `mapPayPalErrorToApiError()` to convert PayPal errors to Saleor-compatible responses

### Logging
- All API requests/responses are logged with full details
- Includes: endpoint, headers, payload, response time, status code
- IMPORTANT: Follow PCI compliance - never log PII data (card numbers, CVV, etc.)
- Log retention: 1-3 months recommended

### Monitoring
- Track OAuth token acquisition times (should be fast due to caching)
- Monitor API response times
- Watch for failed API calls or unexpected silence
- Subscribe to paypal-status.com for outage notifications (recommended)
