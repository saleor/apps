# Saleor PayPal Payment App

A Saleor Payment App that enables merchants to accept online payments through PayPal's payment processing platform.

## Table of Contents

- [Overview](#overview)
- [Supported Payment Methods](#supported-payment-methods)
- [Architecture](#architecture)
- [PayPal API Integration](#paypal-api-integration)
- [Webhook-Based Transaction Lifecycle](#webhook-based-transaction-lifecycle)
- [Configuration Management](#configuration-management)
- [Payment Flow](#payment-flow)
- [Security Implementation](#security-implementation)
- [Error Handling](#error-handling)
- [Development](#development)
- [Technical Specifications](#technical-specifications)

## Overview

**Integration Type**: Saleor Payment App
**Framework**: Next.js 15+ (App Router)
**Language**: TypeScript with strict type safety
**Payment Model**: Server-side processing with webhook-driven lifecycle

This implementation prioritizes **reliability, type safety, and observability** over feature breadth, making it production-ready for standard e-commerce payment processing in the Saleor ecosystem.

## Supported Payment Methods

### Payment Types

1. **Direct Payments (CAPTURE)**
   - Customer pays immediately
   - Funds captured in single step
   - Use case: Standard e-commerce checkout

2. **Authorized Payments (AUTHORIZE)**
   - Two-step process: authorize first, capture later
   - Funds held but not transferred
   - Use case: Pre-orders, reservations, delayed fulfillment

Implementation: `src/app/api/webhooks/saleor/transaction-initialize-session/use-case.ts:121`

### Payment Methods Available

Through PayPal Orders API v2:
- **PayPal Wallet** (primary method)
- **Credit/Debit Cards** (processed through PayPal)
- **PayPal Credit** (available to eligible customers automatically)

**Note**: The specific payment method is selected by the customer in the PayPal UI after order creation.

### Transaction Operations

1. **Charge** - Capture funds
2. **Refund** - Full or partial refunds
3. **Cancel** - Void unauthorized transactions

### Not Supported

- ❌ Recurring payments/subscriptions
- ❌ Venmo (requires separate integration)
- ❌ PayPal Pay Later (BNPL) as explicit option
- ❌ Direct bank transfers (ACH/SEPA)
- ❌ Multi-currency billing (single currency per transaction)

## Architecture

### Directory Structure

```
src/
├── app/api/
│   ├── manifest/              # App manifest with webhook definitions
│   ├── register/              # App registration endpoint
│   ├── trpc/                  # tRPC API routes
│   └── webhooks/saleor/       # Webhook handlers
│       ├── payment-gateway-initialize-session/
│       ├── transaction-initialize-session/
│       ├── transaction-process-session/
│       ├── transaction-charge-requested/
│       ├── transaction-refund-requested/
│       └── transaction-cancelation-requested/
├── modules/
│   ├── paypal/                # PayPal domain logic
│   │   ├── configuration/     # Config management
│   │   ├── paypal-client.ts   # Base API client
│   │   ├── paypal-orders-api.ts
│   │   ├── paypal-refunds-api.ts
│   │   └── types.ts
│   ├── saleor/                # Saleor domain logic
│   ├── transaction-result/    # Result types
│   └── ui/                    # Frontend components
└── pages/                     # UI pages for configuration
```

## PayPal API Integration

### APIs Used

#### 1. OAuth 2.0 API (Authentication)

**Endpoint**: `POST /v1/oauth2/token`
- **Purpose**: Obtain access token using client credentials
- **Authentication**: Basic Auth (Base64 encoded `clientId:clientSecret`)
- **Implementation**: `src/modules/paypal/paypal-client.ts:40`

#### 2. Orders API v2 (Core Payment Processing)

**Base Path**: `/v2/checkout/orders`

**Create Order**
- **Endpoint**: `POST /v2/checkout/orders`
- **Purpose**: Create new payment order with CAPTURE or AUTHORIZE intent
- **Implementation**: `src/modules/paypal/paypal-orders-api.ts:27`

**Capture Order**
- **Endpoint**: `POST /v2/checkout/orders/{orderId}/capture`
- **Purpose**: Capture funds from approved order
- **Implementation**: `src/modules/paypal/paypal-orders-api.ts:52`

**Authorize Order**
- **Endpoint**: `POST /v2/checkout/orders/{orderId}/authorize`
- **Purpose**: Authorize payment for later capture
- **Implementation**: `src/modules/paypal/paypal-orders-api.ts:62`

**Get Order**
- **Endpoint**: `GET /v2/checkout/orders/{orderId}`
- **Purpose**: Retrieve order details and status
- **Implementation**: `src/modules/paypal/paypal-orders-api.ts:72`

#### 3. Payments API v2 (Refunds)

**Endpoint**: `POST /v2/payments/captures/{captureId}/refund`
- **Purpose**: Refund captured payment (full or partial)
- **Implementation**: `src/modules/paypal/paypal-refunds-api.ts:32`

### API Base URLs

- **Sandbox**: `https://api-m.sandbox.paypal.com`
- **Production**: `https://api-m.paypal.com`

**Configuration**: `src/modules/paypal/paypal-env.ts:3`

### API Client Architecture

**Base Client** (`src/modules/paypal/paypal-client.ts`):
- OAuth 2.0 authentication with token caching
- Automatic token refresh (1 minute before expiry)
- Environment-aware base URLs
- Generic request method with type safety

**Authentication Flow**:
```typescript
// POST /v1/oauth2/token
Authorization: Basic base64(clientId:clientSecret)
Body: grant_type=client_credentials
Response: { access_token, expires_in }
```

**API Services**:
- `PayPalOrdersApi` - Order creation, capture, authorization
- `PayPalRefundsApi` - Refund processing

### API Request Structure

**Create Order Request**:
```json
{
  "intent": "CAPTURE",
  "purchase_units": [{
    "amount": {
      "currency_code": "USD",
      "value": "100.00"
    },
    "custom_id": "{\"saleor_transaction_id\":\"...\",\"saleor_channel_id\":\"...\"}"
  }]
}
```

**Metadata Attached**:
- `saleor_transaction_id` - Saleor transaction reference
- `saleor_source_id` - Checkout/Order ID
- `saleor_source_type` - "Checkout" or "Order"
- `saleor_channel_id` - Channel identifier

## Webhook-Based Transaction Lifecycle

The app registers **6 core webhooks** with Saleor:

### Session Initialization Phase

#### 1. PAYMENT_GATEWAY_INITIALIZE_SESSION

- **Endpoint**: `/api/webhooks/saleor/payment-gateway-initialize-session`
- **Purpose**: Returns PayPal Client ID to frontend for SDK initialization
- **Returns**: `{ pk: clientId, environment: "SANDBOX" | "LIVE" }`
- **Handler**: `src/app/api/webhooks/saleor/payment-gateway-initialize-session/`

#### 2. TRANSACTION_INITIALIZE_SESSION

- **Endpoint**: `/api/webhooks/saleor/transaction-initialize-session`
- **Purpose**: Creates PayPal order and returns order details
- **PayPal API Called**: `POST /v2/checkout/orders`
- **Returns**: PayPal order ID, payment status, client data
- **Handler**: `src/app/api/webhooks/saleor/transaction-initialize-session/`

### Payment Processing Phase

#### 3. TRANSACTION_PROCESS_SESSION

- **Endpoint**: `/api/webhooks/saleor/transaction-process-session`
- **Purpose**: Processes approved payment from customer
- **Handler**: `src/app/api/webhooks/saleor/transaction-process-session/`

#### 4. TRANSACTION_CHARGE_REQUESTED

- **Endpoint**: `/api/webhooks/saleor/transaction-charge-requested`
- **Purpose**: Captures funds from authorized/approved order
- **PayPal API Called**: `POST /v2/checkout/orders/{orderId}/capture`
- **Handler**: `src/app/api/webhooks/saleor/transaction-charge-requested/`

### Post-Payment Operations

#### 5. TRANSACTION_REFUND_REQUESTED

- **Endpoint**: `/api/webhooks/saleor/transaction-refund-requested`
- **Purpose**: Refunds captured payment (full or partial)
- **PayPal API Called**: `POST /v2/payments/captures/{captureId}/refund`
- **Handler**: `src/app/api/webhooks/saleor/transaction-refund-requested/`

#### 6. TRANSACTION_CANCELATION_REQUESTED

- **Endpoint**: `/api/webhooks/saleor/transaction-cancelation-requested`
- **Purpose**: Validates order cancellation
- **PayPal API Called**: `GET /v2/checkout/orders/{orderId}`
- **Note**: PayPal has no direct cancel endpoint; verification only
- **Handler**: `src/app/api/webhooks/saleor/transaction-cancelation-requested/`

## Configuration Management

### Storage Architecture

- **Backend**: Saleor Metadata API
- **Metadata Key**: `paypal-config-v1`
- **Repository**: `src/modules/paypal/configuration/paypal-config-repo.ts`

### Configuration Schema

```typescript
{
  id: string;                    // Unique config ID
  name: string;                  // Human-readable name
  clientId: PayPalClientId;      // Branded type (validated string)
  clientSecret: PayPalClientSecret; // Branded type (validated string)
  environment: "SANDBOX" | "LIVE";
}
```

**Implementation**: `src/modules/paypal/configuration/paypal-config.ts`

### Configuration Retrieval Flow

1. Webhook receives Saleor `authData` (API URL + token)
2. `PayPalMetadataManager.createFromAuthData()` creates settings manager
3. GraphQL client fetches metadata from Saleor instance
4. Config parsed and validated with Zod schema
5. Branded types (ClientId, ClientSecret) created for type safety

**Metadata Manager**: `src/modules/paypal/configuration/paypal-metadata-manager.ts`

## Payment Flow

### Complete Payment Journey

```
1. Customer Checkout
   ↓
2. Saleor → PAYMENT_GATEWAY_INITIALIZE_SESSION
   PayPal App → Returns clientId
   ↓
3. Frontend initializes PayPal SDK with clientId
   ↓
4. Saleor → TRANSACTION_INITIALIZE_SESSION
   PayPal App → Creates PayPal order → Returns order ID
   ↓
5. Customer approves payment in PayPal UI
   ↓
6. Saleor → TRANSACTION_PROCESS_SESSION
   PayPal App → Validates approval
   ↓
7. Saleor → TRANSACTION_CHARGE_REQUESTED
   PayPal App → Captures funds → Returns success
   ↓
8. Order Complete

Post-Payment:
- Refund: TRANSACTION_REFUND_REQUESTED → refundCapture API
- Cancel: TRANSACTION_CANCELATION_REQUESTED → getOrder verification
```

### Transaction Statuses

Handled statuses from PayPal Orders API:

```typescript
status: "CREATED" | "SAVED" | "APPROVED" | "VOIDED" | "COMPLETED" | "PAYER_ACTION_REQUIRED"
```

**Implementation**: `src/modules/paypal/types.ts:11`

## Security Implementation

### Authentication

**PayPal OAuth 2.0**:
- Client credentials flow
- Base64-encoded `clientId:clientSecret` in Authorization header
- Bearer token for all API requests
- Token caching with automatic refresh

**Saleor Authentication**:
- JWT token from Saleor APL (Auth Persistence Layer)
- Token included in all GraphQL requests
- Validated by Saleor webhook middleware

### Data Protection

**Sensitive Data Handling**:
- Client credentials stored in Saleor encrypted metadata
- No credentials in code or environment variables (for multi-tenant)
- Branded types prevent accidental logging/exposure

**Environment Separation**:
- Explicit SANDBOX/LIVE environment configuration
- Separate API endpoints prevent cross-environment errors

### Observability & Monitoring

**OpenTelemetry Integration**:
- Distributed tracing with `@saleor/apps-otel`
- Context propagation across webhook calls
- Span attributes for PayPal environment

**Sentry Error Tracking**:
- Automatic exception capture
- Context enrichment with transaction IDs
- Error normalization with `BaseError.normalize()`

**Structured Logging**:
- Logger factory with context: `createLogger("TransactionChargeRequestedUseCase")`
- Log levels: debug, info, warn, error
- Contextual metadata in all log entries

## Error Handling

### Result-Based Pattern (neverthrow)

All operations return `Result<T, E>` instead of throwing exceptions:

```typescript
const result = await paypalOrdersApi.createOrder(...);
result.match(
  (order) => handleSuccess(order),
  (error) => handleFailure(error)
);
```

### Standardized Response Types

**Success Responses**:
- `ChargeSuccessResult` / `AuthorizationSuccessResult`
- `CancelSuccessResult`
- Returns Saleor-formatted money object

**Failure Responses**:
- `ChargeFailureResult` / `AuthorizationFailureResult`
- Includes mapped PayPal error details
- HTTP status code preservation

**Action Required**:
- `ChargeActionRequiredResult` / `AuthorizationActionRequiredResult`
- Returned when customer approval needed
- Includes PayPal order ID for frontend

**Error Mapping**: `src/modules/paypal/paypal-api-error.ts`

## Development

### Environment Setup

1. Copy `.env.example` to `.env.local`
2. Configure required environment variables
3. Install dependencies: `pnpm install`
4. Run development server: `pnpm dev`

### Commands

```bash
# Development
pnpm dev              # Start development server
pnpm dev:debug        # Start with debug logging

# Building & Type Checking
pnpm build            # Build production bundle
pnpm check-types      # Type check the app
tsc --noEmit          # Type check without emit

# Testing
pnpm test             # Run unit tests
pnpm test:ci          # Run tests with coverage
pnpm test:e2e         # Run E2E tests
vitest --project units  # Run unit tests only

# Code Quality
pnpm lint             # Lint code
pnpm lint:fix         # Auto-fix linting issues
pnpm format           # Format code with Prettier

# Code Generation
pnpm generate         # Generate GraphQL types
```

### Type Safety & Domain-Driven Design

#### Branded Types

Prevents primitive obsession with compile-time type safety:

```typescript
type PayPalOrderId = string & { readonly _brand: "PayPalOrderId" };
type PayPalClientId = string & { readonly _brand: "PayPalClientId" };
```

**Implementations**:
- `src/modules/paypal/paypal-order-id.ts`
- `src/modules/paypal/paypal-client-id.ts`
- `src/modules/paypal/paypal-client-secret.ts`

#### Use Case Pattern

Each webhook handler delegates to a dedicated use case class:
- Dependency injection via constructor
- Single responsibility principle
- Testable business logic
- Factory pattern for API clients

## Technical Specifications

**Saleor Version**: `>=3.21 <4`
**Required Permission**: `HANDLE_PAYMENTS`
**App Manifest**: `src/app/api/manifest/route.ts`

### Key Dependencies

- `@saleor/app-sdk` - App framework & authentication
- `neverthrow` - Result-based error handling
- `zod` - Runtime schema validation
- `urql` - GraphQL client
- `modern-errors` - Error class utilities
- `@opentelemetry/api` - Observability
- `@sentry/nextjs` - Error tracking

### Testing Stack

- **Unit Tests**: Vitest with jsdom
- **E2E Tests**: Playwright
- **Mocking**: MSW (Mock Service Worker)

### Unique Aspects vs. Generic PayPal Integration

1. **Multi-tenant by design** - Config per Saleor instance, stored in Saleor metadata
2. **Webhook-driven** - All operations triggered by Saleor webhooks
3. **Type-safe** - Branded types, Zod validation, strict TypeScript
4. **Result-based** - No try-catch, all errors as values
5. **Observable** - Full OpenTelemetry tracing and structured logging
6. **Monorepo-shared** - Reuses workspace packages for common functionality

## References

- [PayPal REST API Documentation](https://developer.paypal.com/api/rest/)
- [PayPal Orders API v2](https://developer.paypal.com/docs/api/orders/v2/)
- [Saleor Payment Apps Documentation](https://docs.saleor.io/docs/3.x/developer/payments/payment-apps)
- [Saleor Apps Monorepo](https://github.com/saleor/apps)

## License

See main repository license.
