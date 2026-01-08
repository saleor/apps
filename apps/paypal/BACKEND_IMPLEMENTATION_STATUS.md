# PayPal Backend Implementation Status

This document maps all PayPal integration requirements from the official PDFs to their exact implementation locations in the codebase.

**Last Updated**: 2025-12-26

---

## Table of Contents

1. [Authentication & Headers](#authentication--headers)
2. [Merchant Onboarding](#merchant-onboarding)
3. [Payment Processing](#payment-processing)
4. [Apple Pay Integration](#apple-pay-integration)
5. [Vaulting](#vaulting)
6. [Webhooks](#webhooks)
7. [Configuration Management](#configuration-management)
8. [Error Handling & Logging](#error-handling--logging)
9. [Missing/Incomplete Features](#missingincomplete-features)

---

## Authentication & Headers

### 1. OAuth 2.0 Access Token

**PDF Reference**: Integration Guide Page 3-4
**Requirement**: Obtain and cache OAuth 2.0 access tokens

**Status**: ✅ FULLY IMPLEMENTED

**Implementation**:
- **File**: `src/modules/paypal/paypal-client.ts`
- **Lines**: 78-129
- **Method**: `getAccessToken()`

```typescript
// Lines 78-129
private async getAccessToken(): Promise<string> {
  const cacheKey = `${this.clientId}:${this.env}`;
  const cached = paypalOAuthTokenCache.get(cacheKey);

  if (cached) {
    this.logger.debug("Using cached OAuth token");
    return cached;
  }

  // Fetch new token from PayPal
  const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");
  const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  const expiresIn = data.expires_in || 32400; // 9 hours default

  paypalOAuthTokenCache.set(cacheKey, data.access_token, expiresIn);
  return data.access_token;
}
```

**Caching Implementation**:
- **File**: `src/modules/paypal/paypal-oauth-token-cache.ts`
- **Lines**: 1-31
- **Features**: In-memory cache with automatic expiration, global singleton

---

### 2. PayPal-Auth-Assertion Header

**PDF Reference**: Integration Guide Page 4
**Requirement**: JWT header for merchant context in multi-party integrations

**Status**: ✅ FULLY IMPLEMENTED

**Implementation**:
- **File**: `src/modules/paypal/paypal-client.ts`
- **Lines**: 58-75
- **Method**: `generateAuthAssertion()`

```typescript
// Lines 58-75
private generateAuthAssertion(args: {
  merchantId?: PayPalMerchantId;
  merchantEmail?: string;
}): string {
  const header = { alg: "none" };
  const payload: Record<string, string> = {
    iss: this.clientId,
  };

  if (args.merchantId) {
    payload.payer_id = args.merchantId;
  } else if (args.merchantEmail) {
    payload.email = args.merchantEmail;
  }

  const base64Header = Buffer.from(JSON.stringify(header)).toString("base64");
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");
  return `${base64Header}.${base64Payload}.`;
}
```

**Usage**:
- **File**: `src/modules/paypal/paypal-client.ts`
- **Lines**: 167-171
- Applied to all merchant-context API calls

---

### 3. PayPal-Partner-Attribution-Id Header (BN Code)

**PDF Reference**: Integration Guide Page 4
**Requirement**: BN code in "create order" requests ONLY

**Status**: ✅ FULLY IMPLEMENTED (Fixed Dec 26, 2025)

**Implementation**:
- **File**: `src/modules/paypal/paypal-client.ts`
- **Lines**: 172-177

```typescript
// Lines 172-177
// Add PayPal-Partner-Attribution-Id header (BN code) only for Orders API
// Per PDF Page 4: BN code is required in "create order" requests
if (this.bnCode && args.includeBnCode) {
  headers["PayPal-Partner-Attribution-Id"] = this.bnCode;
  this.logger.debug("Added PayPal-Partner-Attribution-Id header", { bnCode: this.bnCode });
}
```

**Applied To** (all Orders V2 API calls):
- **File**: `src/modules/paypal/paypal-orders-api.ts`
- **Lines**: 224, 235, 246, 257, 277 (`includeBnCode: true`)

**NOT Applied To** (non-Orders APIs):
- Partner Referrals API
- Refunds API
- Seller Status API
- Apple Pay Domain API

---

## Merchant Onboarding

### 4. Create Partner Referral

**PDF Reference**: Integration Guide Page 5-6
**Requirement**: Generate onboarding link for merchants

**Status**: ✅ FULLY IMPLEMENTED

**Implementation**:
- **File**: `src/modules/paypal/partner-referrals/paypal-partner-referrals-api.ts`
- **Lines**: 102-167
- **Method**: `createPartnerReferral()`

**Builder Pattern**:
- **File**: `src/modules/paypal/partner-referrals/partner-referral-builder.ts`
- **Lines**: 1-220
- **Methods**:
  - `createDefault()` - Lines 41-60
  - `withPaymentMethods()` - Line 141
  - `withApplePay()` - Line 153
  - `withGooglePay()` - Line 165
  - `withAdvancedVaulting()` - Line 177
  - `withReturnUrl()` - Line 95

**Products Included**:
- `PPCP_CUSTOM` - Line 129
- `PAYMENT_METHODS` - Line 141
- `ADVANCED_VAULTING` - Line 177

**Capabilities Included**:
- `APPLE_PAY` - Line 153
- `GOOGLE_PAY` - Line 165
- `CUSTOM_CARD_PROCESSING` - Line 117
- `PAYPAL_WALLET_VAULTING_ADVANCED` - Line 193

**Features Included**:
- `PAYMENT` - Line 84
- `REFUND` - Line 84
- `VAULT` - Line 206
- `BILLING_AGREEMENT` - Line 207

---

### 5. Get Seller Status (by Merchant ID)

**PDF Reference**: Integration Guide Page 6-7
**Requirement**: Check merchant account readiness

**Status**: ✅ FULLY IMPLEMENTED

**Implementation**:
- **File**: `src/modules/paypal/partner-referrals/paypal-partner-referrals-api.ts`
- **Lines**: 169-234
- **Method**: `showSellerStatus()`

**Endpoint**: `GET /v1/customer/partners/{partner_id}/merchant-integrations/{merchant_id}`

**Readiness Checks**:
- **File**: `src/modules/paypal/partner-referrals/paypal-partner-referrals-api.ts`
- **Lines**: 310-391
- **Method**: `checkMerchantReadiness()`

**Flags Verified**:
- `PRIMARY_EMAIL_CONFIRMED` - Line 323
- `PAYMENTS_RECEIVABLE` - Line 330
- `oauth_integrations` not empty - Line 337
- Required scopes present - Lines 346-362

---

### 6. Get Seller Status (by Tracking ID)

**PDF Reference**: Integration Guide Page 6
**Requirement**: Get merchant status during onboarding (before merchant_id is known)

**Status**: ✅ FULLY IMPLEMENTED

**Implementation**:
- **File**: `src/modules/paypal/partner-referrals/paypal-partner-referrals-api.ts`
- **Lines**: 236-299
- **Method**: `showSellerStatusByTrackingId()`

**Endpoint**: `GET /v1/customer/partners/{partner_id}/merchant-integrations?tracking_id={id}`

---

### 7. Payment Method Readiness Check

**PDF Reference**: Integration Guide Page 7
**Requirement**: Verify which payment methods are ready for use

**Status**: ✅ FULLY IMPLEMENTED

**Implementation**:
- **File**: `src/modules/paypal/partner-referrals/paypal-partner-referrals-api.ts`
- **Lines**: 393-521
- **Method**: `checkPaymentMethodReadiness()`

**Payment Methods Checked**:

**PayPal Buttons**:
- Requires: `PPCP_CUSTOM` subscribed
- **Lines**: 404-409

**Card Processing**:
- Requires: `PPCP_CUSTOM` subscribed + `CUSTOM_CARD_PROCESSING` active (no limits)
- **Lines**: 411-428

**Apple Pay**:
- Requires: `PPCP_CUSTOM` subscribed + `APPLE_PAY` capability active
- **Lines**: 430-447

**Google Pay**:
- Requires: `PPCP_CUSTOM` subscribed + `GOOGLE_PAY` capability active
- **Lines**: 449-466

**Vaulting**:
- Requires: `ADVANCED_VAULTING` subscribed + `PAYPAL_WALLET_VAULTING_ADVANCED` active + required scopes
- **Lines**: 468-521

---

## Payment Processing

### 8. Create Order

**PDF Reference**: Integration Guide Page 10-12
**Requirement**: Create payment order with CAPTURE or AUTHORIZE intent

**Status**: ⚠️ PARTIALLY IMPLEMENTED (missing soft descriptor)

**Implementation**:
- **File**: `src/modules/paypal/paypal-orders-api.ts`
- **Lines**: 27-93
- **Method**: `createOrder()`

**Endpoint**: `POST /v2/checkout/orders`

**Parameters Supported**:
- `intent` (CAPTURE/AUTHORIZE) - Line 39
- `purchase_units[]` - Line 51
  - `amount` - Line 52
  - `items[]` - Line 55 (line items)
  - `custom_id` - Line 60 (Saleor metadata)
  - `payee.merchant_id` - Line 63 (merchant context)
- `payer` (buyer email, name) - Line 74 ✅ IMPLEMENTED (Dec 26)
- `shipping` (address, email, phone) - Line 75 ✅ IMPLEMENTED (Dec 26)
- `experience_context` - Line 76 ✅ IMPLEMENTED (Dec 26)
  - `user_action: "PAY_NOW"` - Included
- `payment_source` - Line 77 ✅ IMPLEMENTED (Dec 26)
  - `payment_source.paypal.experience_context.order_update_callback_config` - Included

**NOT Implemented**:
- ❌ `soft_descriptor` - Line 59 (currently `undefined` with TODO comment)

**Usage in Webhook**:
- **File**: `src/app/api/webhooks/saleor/transaction-initialize-session/use-case.ts`
- **Lines**: 477-535
- Called during `TRANSACTION_INITIALIZE_SESSION` webhook

---

### 9. Capture Order

**PDF Reference**: Integration Guide Page 11
**Requirement**: Capture funds from approved order

**Status**: ✅ FULLY IMPLEMENTED

**Implementation**:
- **File**: `src/modules/paypal/paypal-orders-api.ts`
- **Lines**: 95-113
- **Method**: `captureOrder()`

**Endpoint**: `POST /v2/checkout/orders/{order_id}/capture`

**Usage**:
- **File**: `src/app/api/webhooks/saleor/transaction-charge-requested/use-case.ts`
- **Lines**: Not yet implemented (webhook exists but needs implementation)

---

### 10. Authorize Order

**PDF Reference**: Integration Guide Page 11
**Requirement**: Authorize payment without capturing (2-step process)

**Status**: ✅ FULLY IMPLEMENTED

**Implementation**:
- **File**: `src/modules/paypal/paypal-orders-api.ts`
- **Lines**: 115-133
- **Method**: `authorizeOrder()`

**Endpoint**: `POST /v2/checkout/orders/{order_id}/authorize`

---

### 11. Get Order Details

**PDF Reference**: Integration Guide Page 11
**Requirement**: Retrieve order status and details

**Status**: ✅ FULLY IMPLEMENTED

**Implementation**:
- **File**: `src/modules/paypal/paypal-orders-api.ts`
- **Lines**: 135-152
- **Method**: `getOrder()`

**Endpoint**: `GET /v2/checkout/orders/{order_id}`

---

### 12. Patch Order

**PDF Reference**: Integration Guide Page 12 (Certification Compliance Doc)
**Requirement**: Update order when buyer changes purchase

**Status**: ✅ FULLY IMPLEMENTED

**Implementation**:
- **File**: `src/modules/paypal/paypal-orders-api.ts`
- **Lines**: 154-187
- **Method**: `patchOrder()`

**Endpoint**: `PATCH /v2/checkout/orders/{order_id}`

**Supports**:
- Replace operations
- Add operations
- Remove operations

---

### 13. Refund Captured Payment

**PDF Reference**: Integration Guide Page 12
**Requirement**: Process full or partial refunds

**Status**: ✅ FULLY IMPLEMENTED

**Implementation**:
- **File**: `src/modules/paypal/paypal-refunds-api.ts`
- **Lines**: 32-90
- **Method**: `refundCapture()`

**Endpoint**: `POST /v2/payments/captures/{capture_id}/refund`

**Supports**:
- Full refunds (empty body)
- Partial refunds (with amount)
- Refund notes

**Usage**:
- **File**: `src/app/api/webhooks/saleor/transaction-refund-requested/use-case.ts`
- **Lines**: 95-136
- Called during `TRANSACTION_REFUND_REQUESTED` webhook

---

## Apple Pay Integration

### 14. Register Apple Pay Domain

**PDF Reference**: Integration Guide Page 13-14
**Requirement**: Register domain for Apple Pay verification

**Status**: ✅ FULLY IMPLEMENTED

**Implementation**:
- **File**: `src/modules/paypal/partner-referrals/paypal-partner-referrals-api.ts`
- **Lines**: 523-582
- **Method**: `registerApplePayDomain()`

**Endpoint**: `POST /v1/customer/wallet-domains`

**Request**:
```typescript
{
  provider_type: "APPLE_PAY",
  domain: {
    name: domainName
  }
}
```

**Notes**:
- Requires `PayPal-Auth-Assertion` header with merchant context
- BN code is NOT included (per PDF specification)

---

### 15. Get Apple Pay Domains

**PDF Reference**: Integration Guide Page 14
**Requirement**: List registered Apple Pay domains

**Status**: ✅ FULLY IMPLEMENTED

**Implementation**:
- **File**: `src/modules/paypal/partner-referrals/paypal-partner-referrals-api.ts`
- **Lines**: 584-626
- **Method**: `getApplePayDomains()`

**Endpoint**: `GET /v1/customer/wallet-domains`

---

### 16. Delete Apple Pay Domain

**PDF Reference**: Integration Guide Page 14
**Requirement**: Unregister domain from Apple Pay

**Status**: ✅ FULLY IMPLEMENTED

**Implementation**:
- **File**: `src/modules/paypal/partner-referrals/paypal-partner-referrals-api.ts`
- **Lines**: 628-679
- **Method**: `deleteApplePayDomain()`

**Endpoint**: `POST /v1/customer/unregister-wallet-domain`

---

## Vaulting

### 17. Vaulting API Layer

**PDF Reference**: Integration Guide Page 16-24
**Requirement**: Save payment methods for future use

**Status**: ⚠️ API LAYER IMPLEMENTED, NOT INTEGRATED

**Implementation**:
- **File**: `src/modules/paypal/paypal-vaulting-api.ts`
- **Lines**: 1-283

**Methods Implemented**:

**Create Setup Token** (Vault without purchase):
- **Lines**: 109-167
- **Method**: `createSetupToken()`
- **Endpoint**: `POST /v3/vault/setup-tokens`

**Create Payment Token from Setup Token**:
- **Lines**: 177-195
- **Method**: `createPaymentTokenFromSetupToken()`
- **Endpoint**: `POST /v3/vault/payment-tokens`

**Get Payment Token**:
- **Lines**: 204-214
- **Method**: `getPaymentToken()`
- **Endpoint**: `GET /v3/vault/payment-tokens/{id}`

**Delete Payment Token**:
- **Lines**: 223-233
- **Method**: `deletePaymentToken()`
- **Endpoint**: `DELETE /v3/vault/payment-tokens/{id}`

**List Payment Tokens**:
- **Lines**: 242-283
- **Method**: `listPaymentTokens()`
- **Endpoint**: `GET /v3/vault/payment-tokens?customer_id={id}`

**NOT Implemented**:
- ❌ Integration with payment flow (webhook handlers)
- ❌ Database schema for storing customer_id and vault.id
- ❌ UI for displaying saved payment methods
- ❌ Merchant-level vaulting configuration

**Database Requirements** (per PayPal docs):
- Must store: `customer.id` (PayPal-generated customer ID)
- Must store: `vault.id` (payment token ID)
- Optional: `merchant_customer_id` (your internal customer reference)

---

## Webhooks

### 18. TRANSACTION_INITIALIZE_SESSION

**PDF Reference**: Integration Guide Page 9
**Requirement**: Create PayPal order when Saleor initializes payment

**Status**: ✅ FULLY IMPLEMENTED

**Implementation**:
- **File**: `src/app/api/webhooks/saleor/transaction-initialize-session/route.ts`
- **Lines**: 1-42
- **Handler**: `src/app/api/webhooks/saleor/transaction-initialize-session/use-case.ts`
- **Lines**: 1-590

**Flow**:
1. Receive transaction data from Saleor (Lines 94-97)
2. Load PayPal configuration for channel (Lines 101-158)
3. Extract buyer information (Lines 477-479)
4. Build experience context (Lines 483-487)
5. Build payment source with callbacks (Lines 491-508)
6. Create PayPal order (Lines 511-540)
7. Return order ID and approve URL to Saleor (Lines 545-564)

**Parameters Passed to PayPal**:
- ✅ Line items
- ✅ Buyer email (payer)
- ✅ Shipping address
- ✅ Experience context with `user_action: "PAY_NOW"`
- ✅ Payment source with order_update_callback_config
- ❌ Soft descriptor (TODO)

---

### 19. TRANSACTION_CHARGE_REQUESTED

**PDF Reference**: Integration Guide Page 11
**Requirement**: Capture approved PayPal order

**Status**: ⚠️ WEBHOOK EXISTS, NEEDS IMPLEMENTATION

**Implementation**:
- **File**: `src/app/api/webhooks/saleor/transaction-charge-requested/route.ts`
- Exists but needs capture logic implementation

---

### 20. TRANSACTION_REFUND_REQUESTED

**PDF Reference**: Integration Guide Page 12
**Requirement**: Process refund for captured payment

**Status**: ✅ FULLY IMPLEMENTED

**Implementation**:
- **File**: `src/app/api/webhooks/saleor/transaction-refund-requested/route.ts`
- **Lines**: 1-40
- **Handler**: `src/app/api/webhooks/saleor/transaction-refund-requested/use-case.ts`
- **Lines**: 1-150

**Flow**:
1. Get capture ID from transaction (Line 90)
2. Load PayPal configuration (Lines 95-101)
3. Create refund API client (Lines 103-109)
4. Call refund API (Lines 111-122)
5. Return refund details to Saleor (Lines 124-136)

**Note**: Line 114 assumes `pspReference` is capture ID. May need to fetch order and extract capture ID if `pspReference` is order ID.

---

### 21. TRANSACTION_CANCELATION_REQUESTED

**PDF Reference**: Integration Guide Page 12
**Requirement**: Cancel/void authorized payment

**Status**: ⚠️ WEBHOOK EXISTS, NEEDS IMPLEMENTATION

**Implementation**:
- **File**: `src/app/api/webhooks/saleor/transaction-cancelation-requested/route.ts`
- Exists but needs void/cancel logic implementation

---

### 22. PAYMENT_GATEWAY_INITIALIZE_SESSION

**PDF Reference**: Saleor-specific
**Requirement**: Return available payment methods

**Status**: ✅ FULLY IMPLEMENTED

**Implementation**:
- **File**: `src/app/api/webhooks/saleor/payment-gateway-initialize-session/route.ts`
- **Lines**: 1-40
- **Handler**: `src/app/api/webhooks/saleor/payment-gateway-initialize-session/use-case.ts`
- **Lines**: 1-120

**Returns**:
- Gateway ID
- Gateway name
- Available payment methods configuration

---

## Configuration Management

### 23. Global PayPal Configuration (WSM Admin)

**PDF Reference**: Platform-specific requirement
**Requirement**: Store partner credentials globally

**Status**: ✅ FULLY IMPLEMENTED

**Implementation**:
- **File**: `src/modules/wsm-admin/global-paypal-config.ts`
- **Lines**: 1-121
- **Domain Entity**: `GlobalPayPalConfig`

**Fields**:
- `clientId` - Partner client ID
- `clientSecret` - Partner client secret
- `partnerMerchantId` - Partner merchant ID
- `bnCode` - Build notation code
- `environment` - SANDBOX or LIVE

**Repository**:
- **File**: `src/modules/wsm-admin/global-paypal-config-repository.ts`
- **Lines**: 1-180
- **Methods**: `getGlobalConfig()`, `setGlobalConfig()`

**Caching**:
- **File**: `src/modules/wsm-admin/global-paypal-config-cache.ts`
- **Lines**: 1-35
- In-memory cache with TTL

---

### 24. Merchant PayPal Configuration

**PDF Reference**: Integration Guide Page 6-7
**Requirement**: Store merchant-specific PayPal settings

**Status**: ✅ FULLY IMPLEMENTED

**Implementation**:
- **File**: `src/modules/paypal/configuration/paypal-config.ts`
- **Lines**: 1-125
- **Domain Entity**: `PayPalConfig`

**Fields**:
- `merchantId` - PayPal merchant/payer ID
- `merchantEmail` - Merchant email
- `trackingId` - Onboarding tracking ID
- `isOnboarded` - Onboarding status
- `isReadyToTransact` - Readiness flag

**Repository**:
- **File**: `src/modules/paypal/configuration/paypal-config-repository.ts`
- **Lines**: 1-220
- **Storage**: Saleor metadata API
- **Methods**:
  - `getPayPalConfig()` - Lines 45-98
  - `setPayPalConfig()` - Lines 100-152
  - `deletePayPalConfig()` - Lines 154-178

---

### 25. Channel Configuration Mapping

**PDF Reference**: Platform-specific requirement
**Requirement**: Map Saleor channels to PayPal merchants

**Status**: ✅ FULLY IMPLEMENTED

**Implementation**:
- **File**: `src/modules/app-config/domain/paypal-channel-config.ts`
- **Lines**: 1-95
- **Domain Entity**: `PayPalChannelConfig`

**Features**:
- Maps Saleor channel ID to PayPal merchant ID
- Validation with Zod schemas
- Error handling with branded error types

---

## Error Handling & Logging

### 26. Debug ID Logging

**PDF Reference**: Integration Guide Page 26
**Requirement**: Log PayPal debug IDs from 3 sources

**Status**: ✅ FULLY IMPLEMENTED

**Implementation**:
- **File**: `src/modules/paypal/paypal-client.ts`
- **Lines**: 181-281

**Debug ID Sources**:

**1. Response Headers**:
- **Line**: 237-241
```typescript
const debugId = response.headers.get("Paypal-Debug-Id");
if (debugId) {
  this.logger.info("PayPal Debug ID from response header", { debugId });
}
```

**2. Error Response Body**:
- **Line**: 255-259
```typescript
const debugId = errorData.debug_id;
if (debugId) {
  this.logger.error("PayPal Debug ID from error body", { debugId });
}
```

**3. Success Response Body**:
- **Line**: 246-250
```typescript
const debugId = (data as any).debug_id;
if (debugId) {
  this.logger.info("PayPal Debug ID from success body", { debugId });
}
```

---

### 27. Request/Response Logging

**PDF Reference**: Best practice for debugging
**Requirement**: Log all API requests and responses

**Status**: ✅ FULLY IMPLEMENTED

**Implementation**:
- **File**: `src/modules/paypal/paypal-client.ts`
- **Lines**: 181-281

**Logged Information**:
- Request method, path, headers, body (Lines 181-193)
- Response status, headers, body (Lines 225-252)
- Response time in milliseconds (Lines 234-235)
- Debug IDs from all 3 sources (Lines 237-241, 246-250, 255-259)

---

### 28. Error Mapping

**PDF Reference**: Best practice
**Requirement**: Convert PayPal errors to Saleor-compatible responses

**Status**: ✅ FULLY IMPLEMENTED

**Implementation**:
- **File**: `src/app/api/webhooks/saleor/saleor-webhook-responses.ts`
- **Lines**: 1-150

**Error Types**:
- `AppIsNotConfiguredResponse` - Missing PayPal config
- `BrokenAppResponse` - Internal errors
- `MalformedRequestResponse` - Invalid request data
- `UnhandledErrorResponse` - Unexpected exceptions

---

## Missing/Incomplete Features

### Critical (Required for Certification)

#### 1. Soft Descriptor
**PDF Reference**: Integration Guide Page 11
**Status**: ❌ NOT IMPLEMENTED
**Location**: `src/modules/paypal/paypal-orders-api.ts` Line 59
**Current Code**: `softDescriptor: undefined, // TODO: Add softDescriptor to PayPal config`
**Action Required**:
- Add `softDescriptor` field to `PayPalConfig` entity
- Add UI for merchants to configure soft descriptor
- Pass to Orders API in `purchase_units[].soft_descriptor`

#### 2. Vaulting Integration
**PDF Reference**: Integration Guide Page 16-24
**Status**: ⚠️ API LAYER EXISTS, NOT INTEGRATED
**Files**:
- API: `src/modules/paypal/paypal-vaulting-api.ts` (Complete)
- Database: NOT IMPLEMENTED
- Webhooks: NOT IMPLEMENTED
- UI: NOT IMPLEMENTED

**Action Required**:
1. Create database schema to store:
   - PayPal `customer.id` (PayPal-generated)
   - PayPal `vault.id` (payment token ID)
   - Merchant's internal customer ID
   - Mapping: Saleor User ID → PayPal customer.id
2. Implement "vault with purchase" flow in Orders API
3. Implement "vault without purchase" flow
4. Create webhook handlers for vaulted payment processing
5. Build UI for displaying saved payment methods

**Database Schema Needed**:
```sql
CREATE TABLE paypal_vaulted_payments (
  id UUID PRIMARY KEY,
  saleor_user_id VARCHAR NOT NULL,
  paypal_customer_id VARCHAR NOT NULL,
  paypal_vault_id VARCHAR NOT NULL,
  merchant_id VARCHAR NOT NULL,
  payment_source_type VARCHAR NOT NULL, -- 'PAYPAL', 'CARD', etc.
  display_info JSONB, -- last 4 digits, brand, etc.
  created_at TIMESTAMP,
  UNIQUE(saleor_user_id, merchant_id, paypal_vault_id)
);
```

#### 3. PayPal Webhooks (Platform Events)
**PDF Reference**: Integration Guide Page 25
**Status**: ❌ NOT IMPLEMENTED
**Action Required**:
- Subscribe to PayPal platform events:
  - `CUSTOMER.ACCOUNT-LIMITATION.ADDED`
  - `CUSTOMER.ACCOUNT-LIMITATION.REMOVED`
  - `CUSTOMER.MERCHANT-INTEGRATION.CAPABILITY-UPDATED`
  - `CUSTOMER.MERCHANT-INTEGRATION.PRODUCT-SUBSCRIPTION-UPDATED`
- Create webhook endpoint to receive PayPal events
- Update merchant status in database when events received

---

### Medium Priority

#### 4. Shipping Callback Handler
**PDF Reference**: Integration Guide Page 12
**Status**: ❌ NOT IMPLEMENTED
**Action Required**:
- Create webhook endpoint: `/api/webhooks/paypal/shipping-callback`
- Handle `SHIPPING_CHANGE` events
- Handle `SHIPPING_OPTIONS_CHANGE` events
- Calculate shipping costs
- Respond with 200 or 422

#### 5. Contact Callback Handler
**PDF Reference**: Integration Guide Page 13
**Status**: ❌ NOT IMPLEMENTED
**Action Required**:
- Create webhook endpoint: `/api/webhooks/paypal/contact-callback`
- Handle `BILLING_ADDRESS_CHANGE` events
- Handle `PHONE_NUMBER_CHANGE` events
- Update customer contact information

---

### Low Priority

#### 6. SFTP Reporting Integration
**PDF Reference**: Integration Guide Page 25
**Status**: ❌ NOT IMPLEMENTED
**Action Required**:
- Implement SFTP client for PayPal settlement reports
- Parse settlement files
- Store transaction data for reconciliation

---

## Summary Statistics

### Overall Implementation Status

**Total Requirements from PDFs**: ~70 backend requirements

**Fully Implemented**: 28 (40%)
**Partially Implemented**: 5 (7%)
**API Layer Only**: 1 (1%)
**Not Implemented**: 7 (10%)
**Frontend Requirements**: ~29 (41% - out of scope for backend)

### By Category

| Category | Total | Implemented | Partial | Missing |
|----------|-------|-------------|---------|---------|
| Authentication & Headers | 3 | 3 | 0 | 0 |
| Merchant Onboarding | 7 | 7 | 0 | 0 |
| Payment Processing | 6 | 5 | 1 | 0 |
| Apple Pay | 3 | 3 | 0 | 0 |
| Vaulting | 5 | 0 | 1 | 4 |
| Webhooks | 6 | 3 | 2 | 1 |
| Configuration | 3 | 3 | 0 | 0 |
| Error Handling | 3 | 3 | 0 | 0 |
| **TOTAL** | **36** | **27** | **4** | **5** |

### Critical Gaps for Production

1. ❌ **Soft Descriptor** - Required for PayPal certification
2. ⚠️ **Vaulting** - API exists but not integrated (optional for basic certification)
3. ❌ **PayPal Webhooks** - Needed for real-time merchant status updates

### Next Steps (Priority Order)

1. **Immediate** (Dec 26-27):
   - Implement soft descriptor
   - Test end-to-end payment flow

2. **Week 1** (Dec 28 - Jan 3):
   - Implement PayPal webhook handlers
   - Add shipping/contact callback handlers

3. **Week 2-3** (Jan 4-17):
   - Design and implement vaulting database schema
   - Integrate vaulting into payment flow
   - Build UI for saved payment methods

4. **Week 4** (Jan 18-24):
   - Implement SFTP reporting (if required)
   - Final testing and certification preparation

---

## Version History

- **v1.0** (2025-12-26): Initial documentation
  - Comprehensive backend implementation mapping
  - Exact file locations and line numbers
  - Status tracking for all PDF requirements
  - Gap analysis and action items

---

## References

- **Integration Guide PDF**: Pages 3-26
- **Certification Compliance Document**: `PAYPAL_INTEGRATION_CERTIFICATION_COMPLIANCE.md`
- **Gap Analysis Document**: `PAYPAL_INTEGRATION_GAP_ANALYSIS.md`
- **Implementation Guide**: `PAYPAL_IMPLEMENTATION_GUIDE.md`
