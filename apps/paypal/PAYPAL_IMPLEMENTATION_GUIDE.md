# PayPal Complete Payments Implementation Guide

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [PayPal API Endpoints Reference](#paypal-api-endpoints-reference)
4. [Merchant Onboarding Implementation](#merchant-onboarding-implementation)
5. [Payment Processing Implementation](#payment-processing-implementation)
6. [Apple Pay Integration](#apple-pay-integration)
7. [Step-by-Step Integration Guide](#step-by-step-integration-guide)
8. [Testing in Sandbox](#testing-in-sandbox)
9. [Production Deployment](#production-deployment)
10. [Troubleshooting](#troubleshooting)

---

## Overview

This guide provides a comprehensive walkthrough for implementing PayPal Complete Payments  in a multi-party/platform environment where you onboard sellers and process payments on their behalf.

### Key Concepts

- **Partner** - Your platform (Web Shop Manager)
- **Merchant/Seller** - Individual businesses using your platform
- **Multi-party Integration** - Platform processes payments on behalf of merchants
- **PayPal-Auth-Assertion** - Header required for partner-on-behalf-of-merchant API calls

---

## Prerequisites

### 1. PayPal Developer Account Setup

1. Create PayPal Developer Account at [developer.paypal.com](https://developer.paypal.com)
2. Create REST API application
3. Get credentials:
   - **Client ID** - Public identifier
   - **Client Secret** - Private key (keep secure)
   - **Partner Merchant ID** - Your platform's PayPal merchant ID

### 2. Environment Configuration

```typescript
// Environment types
type PayPalEnv = "SANDBOX" | "LIVE";

// API Base URLs
const API_URLS = {
  SANDBOX: "https://api-m.sandbox.paypal.com",
  LIVE: "https://api-m.paypal.com"
};
```

**Implementation**: `src/modules/paypal/paypal-env.ts`

### 3. Required Scopes

Ensure your PayPal REST app has these scopes enabled:
- `https://uri.paypal.com/services/payments/realtimepayment`
- `https://uri.paypal.com/services/payments/partnerfee`
- `https://uri.paypal.com/services/payments/refund`
- `https://uri.paypal.com/services/payments/payment/authcapture`

---

## PayPal API Endpoints Reference

### Authentication

#### 1. Get Access Token
```
POST /v1/oauth2/token
```

**Purpose**: Obtain OAuth 2.0 access token for API authentication

**Authentication**: Basic Auth (Base64 encoded `clientId:clientSecret`)

**Request**:
```bash
POST https://api-m.sandbox.paypal.com/v1/oauth2/token
Authorization: Basic {base64(clientId:clientSecret)}
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
```

**Response**:
```json
{
  "access_token": "A21AAL...",
  "token_type": "Bearer",
  "expires_in": 32400
}
```

**Implementation**: `src/modules/paypal/paypal-client.ts:78`

**Usage**: Called automatically before each API request, tokens cached until expiry

---

### Merchant Onboarding APIs

#### 2. Create Partner Referral
```
POST /v2/customer/partner-referrals
```

**Purpose**: Generate onboarding link for merchants to connect their PayPal account

**Authentication**: Bearer token + No merchant context needed

**Request**:
```json
{
  "tracking_id": "unique-tracking-id-123",
  "operations": [
    {
      "operation": "API_INTEGRATION",
      "api_integration_preference": {
        "rest_api_integration": {
          "integration_method": "PAYPAL",
          "integration_type": "THIRD_PARTY",
          "third_party_details": {
            "features": [
              "PAYMENT",
              "REFUND"
            ]
          }
        }
      }
    }
  ],
  "products": [
    "PPCP_CUSTOM",
    "PAYMENT_METHODS"
  ],
  "capabilities": [
    "APPLE_PAY",
    "GOOGLE_PAY",
    "CUSTOM_CARD_PROCESSING"
  ],
  "legal_country_code": "US",
  "email": "merchant@example.com",
  "preferred_language_code": "en-US",
  "partner_config_override": {
    "return_url": "https://yourplatform.com/paypal/return",
    "return_url_description": "Return to your dashboard"
  }
}
```

**Response**:
```json
{
  "links": [
    {
      "href": "https://www.sandbox.paypal.com/...",
      "rel": "action_url",
      "method": "GET",
      "description": "Redirect seller to PayPal onboarding"
    }
  ]
}
```

**Implementation**: `src/modules/paypal/partner-referrals/paypal-partner-referrals-api.ts:102`

**Next Step**: Redirect merchant to `action_url` to complete onboarding

---

#### 3. Get Seller Status (by Merchant ID)
```
GET /v1/customer/partners/{partner_merchant_id}/merchant-integrations/{merchant_id}
```

**Purpose**: Check merchant account status and capabilities

**Authentication**: Bearer token + No merchant context needed (uses path parameter)

**Request**:
```
GET https://api-m.sandbox.paypal.com/v1/customer/partners/PARTNER_ID/merchant-integrations/MERCHANT_ID
Authorization: Bearer {access_token}
```

**Response**:
```json
{
  "merchant_id": "MERCHANT_ID_123",
  "tracking_id": "unique-tracking-id-123",
  "products": [
    {
      "name": "PPCP_CUSTOM",
      "vetting_status": "SUBSCRIBED",
      "capabilities": ["APPLE_PAY", "GOOGLE_PAY"]
    }
  ],
  "capabilities": [
    {
      "name": "APPLE_PAY",
      "status": "ACTIVE"
    }
  ],
  "payments_receivable": true,
  "primary_email_confirmed": true,
  "oauth_integrations": [
    {
      "integration_type": "OAUTH_THIRD_PARTY",
      "oauth_third_party": [
        {
          "partner_client_id": "your-client-id",
          "merchant_client_id": "merchant-client-id"
        }
      ]
    }
  ]
}
```

**Implementation**: `src/modules/paypal/partner-referrals/paypal-partner-referrals-api.ts:169`

**Check List for Merchant Readiness**:
- ✅ `primary_email_confirmed: true`
- ✅ `payments_receivable: true`
- ✅ `oauth_integrations` array is not empty
- ✅ Required capabilities are `ACTIVE`

---

#### 4. Get Seller Status (by Tracking ID)
```
GET /v1/customer/partners/{partner_merchant_id}/merchant-integrations?tracking_id={tracking_id}
```

**Purpose**: Get merchant status when you don't have merchant_id yet (during onboarding)

**Authentication**: Bearer token + No merchant context needed

**Request**:
```
GET https://api-m.sandbox.paypal.com/v1/customer/partners/KZT9DGWJNBM8L/merchant-integrations?tracking_id=unique-tracking-id-123
Authorization: Bearer {access_token}
```

**Response**: Same as Get Seller Status (includes `merchant_id` field)

**Implementation**: `src/modules/paypal/partner-referrals/paypal-partner-referrals-api.ts:236`

**Use Case**: Poll this endpoint after merchant completes onboarding to get their `merchant_id`

---

### Payment Processing APIs

#### 5. Create Order
```
POST /v2/checkout/orders
```

**Purpose**: Create a new payment order with CAPTURE or AUTHORIZE intent

**Authentication**: Bearer token + PayPal-Auth-Assertion header (merchant context)

**Headers**:
```
Authorization: Bearer {access_token}
PayPal-Auth-Assertion: {base64_header}.{base64_payload}.
Content-Type: application/json
```

**PayPal-Auth-Assertion Format**:
```json
// Header (base64 encoded)
{"alg":"none"}

// Payload (base64 encoded)
{
  "iss": "partner_client_id",
  "payer_id": "merchant_id"
}
```

**Request**:
```json
{
  "intent": "CAPTURE",
  "purchase_units": [
    {
      "amount": {
        "currency_code": "USD",
        "value": "100.00"
      },
      "custom_id": "{\"transaction_id\":\"abc-123\"}"
    }
  ]
}
```

**Response**:
```json
{
  "id": "8XN12345ABCD",
  "status": "CREATED",
  "links": [
    {
      "href": "https://www.sandbox.paypal.com/checkoutnow?token=8XN12345ABCD",
      "rel": "approve",
      "method": "GET"
    }
  ]
}
```

**Implementation**: `src/modules/paypal/paypal-orders-api.ts:27`

**Next Step**: Redirect customer to `approve` link to complete payment

---

#### 6. Capture Order
```
POST /v2/checkout/orders/{order_id}/capture
```

**Purpose**: Capture funds from an approved order

**Authentication**: Bearer token + PayPal-Auth-Assertion header (merchant context)

**Request**:
```
POST https://api-m.sandbox.paypal.com/v2/checkout/orders/8XN12345ABCD/capture
Authorization: Bearer {access_token}
PayPal-Auth-Assertion: {auth_assertion}
Content-Type: application/json
```

**Response**:
```json
{
  "id": "8XN12345ABCD",
  "status": "COMPLETED",
  "purchase_units": [
    {
      "payments": {
        "captures": [
          {
            "id": "CAPTURE123",
            "status": "COMPLETED",
            "amount": {
              "currency_code": "USD",
              "value": "100.00"
            }
          }
        ]
      }
    }
  ]
}
```

**Implementation**: `src/modules/paypal/paypal-orders-api.ts:52`

**Capture ID**: Save `captures[0].id` for refunds

---

#### 7. Authorize Order
```
POST /v2/checkout/orders/{order_id}/authorize
```

**Purpose**: Authorize payment without capturing funds (2-step process)

**Authentication**: Bearer token + PayPal-Auth-Assertion header (merchant context)

**Request**: Same structure as Capture Order

**Response**:
```json
{
  "id": "8XN12345ABCD",
  "status": "COMPLETED",
  "purchase_units": [
    {
      "payments": {
        "authorizations": [
          {
            "id": "AUTH123",
            "status": "CREATED",
            "amount": {
              "currency_code": "USD",
              "value": "100.00"
            },
            "expiration_time": "2025-11-15T00:00:00Z"
          }
        ]
      }
    }
  ]
}
```

**Implementation**: `src/modules/paypal/paypal-orders-api.ts:62`

**Note**: Authorization expires after 3 days (29 days for certain industries)

---

#### 8. Get Order Details
```
GET /v2/checkout/orders/{order_id}
```

**Purpose**: Retrieve order details and current status

**Authentication**: Bearer token + PayPal-Auth-Assertion header (merchant context)

**Request**:
```
GET https://api-m.sandbox.paypal.com/v2/checkout/orders/8XN12345ABCD
Authorization: Bearer {access_token}
PayPal-Auth-Assertion: {auth_assertion}
```

**Implementation**: `src/modules/paypal/paypal-orders-api.ts:72`

**Use Case**: Verify order status before processing

---

#### 9. Refund Captured Payment
```
POST /v2/payments/captures/{capture_id}/refund
```

**Purpose**: Refund a captured payment (full or partial)

**Authentication**: Bearer token + PayPal-Auth-Assertion header (merchant context)

**Request (Full Refund)**:
```json
POST https://api-m.sandbox.paypal.com/v2/payments/captures/CAPTURE123/refund
Authorization: Bearer {access_token}
PayPal-Auth-Assertion: {auth_assertion}
Content-Type: application/json

{}
```

**Request (Partial Refund)**:
```json
{
  "amount": {
    "currency_code": "USD",
    "value": "50.00"
  },
  "note_to_payer": "Partial refund for damaged item"
}
```

**Response**:
```json
{
  "id": "REFUND123",
  "status": "COMPLETED",
  "amount": {
    "currency_code": "USD",
    "value": "50.00"
  }
}
```

**Implementation**: `src/modules/paypal/paypal-refunds-api.ts:32`

---

### Apple Pay Domain Registration APIs

#### 10. Register Apple Pay Domain
```
POST /v1/customer/wallet-domains
```

**Purpose**: Register a domain for Apple Pay with PayPal

**Authentication**: Bearer token + PayPal-Auth-Assertion header (merchant context)

**Request**:
```json
{
  "provider_type": "APPLE_PAY",
  "domain": {
    "name": "example.com"
  }
}
```

**Response**:
```json
{
  "provider_type": "APPLE_PAY",
  "domain": {
    "name": "example.com"
  },
  "status": "VERIFIED"
}
```

**Implementation**: `src/modules/paypal/partner-referrals/paypal-partner-referrals-api.ts:417`

**⚠️ Important**: This endpoint may have limited support in sandbox environment. See [Apple Pay Integration](#apple-pay-integration) section.

---

#### 11. Get Apple Pay Domains
```
GET /v1/customer/wallet-domains
```

**Purpose**: List all registered Apple Pay domains for a merchant

**Authentication**: Bearer token + PayPal-Auth-Assertion header (merchant context)

**Request**:
```
GET https://api-m.sandbox.paypal.com/v1/customer/wallet-domains
Authorization: Bearer {access_token}
PayPal-Auth-Assertion: {auth_assertion}
```

**Response**:
```json
{
  "domains": [
    {
      "provider_type": "APPLE_PAY",
      "domain": {
        "name": "example.com"
      },
      "status": "VERIFIED",
      "created_at": "2025-11-10T08:00:00Z"
    }
  ]
}
```

**Implementation**: `src/modules/paypal/partner-referrals/paypal-partner-referrals-api.ts:470`

---

#### 12. Unregister Apple Pay Domain
```
POST /v1/customer/unregister-wallet-domain
```

**Purpose**: Remove a registered Apple Pay domain

**Authentication**: Bearer token + PayPal-Auth-Assertion header (merchant context)

**Request**:
```json
{
  "provider_type": "APPLE_PAY",
  "domain": {
    "name": "example.com"
  }
}
```

**Implementation**: `src/modules/paypal/partner-referrals/paypal-partner-referrals-api.ts:518`

---

## Merchant Onboarding Implementation

### Step 1: Create Partner Referral

**Handler**: `src/modules/merchant-onboarding/trpc-handlers/create-merchant-referral-trpc-handler.ts`

**Process**:
1. Generate unique `tracking_id` for merchant
2. Create partner referral request with:
   - Products: `["PPCP_CUSTOM", "PAYMENT_METHODS"]`
   - Capabilities: `["APPLE_PAY", "GOOGLE_PAY", "CUSTOM_CARD_PROCESSING"]`
   - Merchant email and country
3. Call PayPal API: `POST /v2/customer/partner-referrals`
4. Extract `action_url` from response
5. Store `tracking_id` in database
6. Return `action_url` to frontend

**Frontend Flow**:
```typescript
// 1. Call your backend to create referral
const { actionUrl, trackingId } = await createMerchantReferral({
  merchantEmail: "seller@example.com",
  country: "US"
});

// 2. Redirect merchant to PayPal onboarding
window.location.href = actionUrl;

// 3. Merchant completes onboarding on PayPal
// 4. PayPal redirects back to your return_url
```

---

### Step 2: Handle Onboarding Return

**Return URL**: Should include `trackingId` parameter

**Process**:
1. Merchant returns from PayPal to: `https://yourplatform.com/paypal/return?trackingId=123`
2. Poll seller status API to get merchant_id
3. Save merchant_id to database
4. Check merchant readiness flags

**Handler**: `src/modules/merchant-onboarding/trpc-handlers/refresh-merchant-status-trpc-handler.ts`

```typescript
// Poll for merchant status
async function checkMerchantStatus(trackingId: string) {
  const status = await getSellerStatusByTrackingId(trackingId);

  // Save merchant ID
  const merchantId = status.merchant_id;

  // Verify readiness
  if (!status.primary_email_confirmed) {
    throw new Error("Merchant must confirm email");
  }

  if (!status.payments_receivable) {
    throw new Error("Merchant account restricted");
  }

  if (!status.oauth_integrations?.length) {
    throw new Error("Merchant must grant permissions");
  }

  return {
    merchantId,
    ready: true,
    capabilities: status.capabilities
  };
}
```

---

### Step 3: Check Payment Method Readiness

**Handler**: `src/modules/paypal/partner-referrals/paypal-partner-referrals-api.ts:301`

**Check Criteria**:

**Apple Pay Ready**:
- Product `PPCP_CUSTOM` with `vetting_status: "SUBSCRIBED"`
- Product `PAYMENT_METHODS` with `vetting_status: "SUBSCRIBED"`
- Capability `APPLE_PAY` with `status: "ACTIVE"`

**Google Pay Ready**:
- Product `PPCP_CUSTOM` with `vetting_status: "SUBSCRIBED"`
- Product `PAYMENT_METHODS` with `vetting_status: "SUBSCRIBED"`
- Capability `GOOGLE_PAY` with `status: "ACTIVE"`

**Card Processing Ready**:
- Product `PPCP_CUSTOM` with `vetting_status: "SUBSCRIBED"`
- Capability `CUSTOM_CARD_PROCESSING` with `status: "ACTIVE"` and no `limits`

---

## Payment Processing Implementation

### Step 1: Initialize Payment Session

**Webhook**: `TRANSACTION_INITIALIZE_SESSION`

**Handler**: `src/app/api/webhooks/saleor/transaction-initialize-session/`

**Process**:
1. Receive webhook from Saleor with transaction data
2. Get merchant configuration (merchant_id, client credentials)
3. Create PayPal order with merchant context
4. Return order details to Saleor

```typescript
async function initializeSession(data: TransactionInitializeSessionData) {
  // 1. Get merchant config
  const config = await getPayPalConfig(data.sourceObject.channel.id);

  // 2. Create PayPal order
  const order = await createOrder({
    intent: "CAPTURE", // or "AUTHORIZE"
    merchantId: config.merchantId,
    amount: {
      currency: data.action.currency,
      value: data.action.amount.toFixed(2)
    },
    metadata: {
      transactionId: data.transaction.id,
      sourceId: data.sourceObject.id
    }
  });

  // 3. Return to Saleor
  return {
    pspReference: order.id,
    data: {
      paypalOrderId: order.id,
      approveUrl: order.links.find(l => l.rel === "approve")?.href
    }
  };
}
```

---

### Step 2: Customer Approval

**Frontend Flow**:
```typescript
// 1. Get order details from Saleor transaction
const transaction = await getTransaction(transactionId);
const approveUrl = transaction.data.approveUrl;

// 2. Redirect customer to PayPal
window.location.href = approveUrl;

// 3. Customer approves payment on PayPal
// 4. PayPal redirects back to your checkout page
```

---

### Step 3: Process Approved Payment

**Webhook**: `TRANSACTION_PROCESS_SESSION`

**Handler**: `src/app/api/webhooks/saleor/transaction-process-session/`

**Process**:
1. Verify payment was approved by customer
2. Optionally capture immediately or wait for TRANSACTION_CHARGE_REQUESTED

---

### Step 4: Capture Payment

**Webhook**: `TRANSACTION_CHARGE_REQUESTED`

**Handler**: `src/app/api/webhooks/saleor/transaction-charge-requested/`

**Process**:
1. Get PayPal order ID from transaction
2. Capture order with merchant context
3. Extract capture ID
4. Return success to Saleor

```typescript
async function chargeTransaction(data: TransactionChargeRequestedData) {
  const orderId = data.transaction.pspReference;

  // Capture with merchant context
  const result = await captureOrder(orderId, {
    merchantId: merchantConfig.merchantId
  });

  const capture = result.purchase_units[0].payments.captures[0];

  return {
    pspReference: capture.id, // Save for refunds
    amount: parseFloat(capture.amount.value),
    result: "CHARGE_SUCCESS"
  };
}
```

---

### Step 5: Handle Refunds

**Webhook**: `TRANSACTION_REFUND_REQUESTED`

**Handler**: `src/app/api/webhooks/saleor/transaction-refund-requested/`

**Process**:
1. Get capture ID from charged transaction
2. Create refund with merchant context
3. Return refund details to Saleor

```typescript
async function refundTransaction(data: TransactionRefundRequestedData) {
  const captureId = data.transaction.pspReference;

  const refund = await refundCapture(captureId, {
    merchantId: merchantConfig.merchantId,
    amount: {
      currency: data.action.currency,
      value: data.action.amount.toFixed(2)
    }
  });

  return {
    pspReference: refund.id,
    amount: parseFloat(refund.amount.value),
    result: "REFUND_SUCCESS"
  };
}
```

---

## Apple Pay Integration

### Overview

Apple Pay integration requires domain verification. The merchant's domain must be registered with Apple Pay through PayPal.

### Prerequisites

1. **Merchant Readiness**:
   - Merchant onboarded with `PAYMENT_METHODS` product
   - `APPLE_PAY` capability is `ACTIVE`

2. **Domain Requirements**:
   - Domain must be accessible via HTTPS
   - Domain association file hosted at: `/.well-known/apple-developer-merchant-id-domain-association`
   - Content-Type: `application/octet-stream`
   - No redirects (Apple rejects 3XX responses)

### Domain Verification File

Download the domain association file from Apple Developer Portal and host it at:
```
https://example.com/.well-known/apple-developer-merchant-id-domain-association
```

### Domain Registration Flow

**Handler**: `src/modules/merchant-onboarding/trpc-handlers/register-apple-pay-domain-handler.ts`

```typescript
// 1. Verify merchant has Apple Pay enabled
const merchantStatus = await getSellerStatus(merchantId);
const applePay = merchantStatus.capabilities.find(c => c.name === "APPLE_PAY");

if (applePay?.status !== "ACTIVE") {
  throw new Error("Merchant does not have Apple Pay enabled");
}

// 2. Register domain
const result = await registerApplePayDomain(merchantId, {
  provider_type: "APPLE_PAY",
  domain: {
    name: "example.com"
  }
});

// 3. Check status
console.log(result.status); // "VERIFIED", "PENDING", or "DENIED"
```

### ⚠️ Sandbox Limitations

**Known Issue**: The `/v1/customer/wallet-domains` endpoint may return `500 Internal Server Error` in sandbox environment.

**Possible Causes**:
1. Limited sandbox support for Apple Pay domain registration
2. Additional merchant account verification required
3. Sandbox account not fully provisioned

**Recommendations**:
1. **Contact PayPal Support** with debug IDs from error logs
2. **Test in Production** once live credentials are available
3. **Mock for Development** - Skip domain registration in sandbox

**Workaround for Development**:
```typescript
if (config.environment === "SANDBOX") {
  // Skip actual registration in sandbox
  return {
    success: true,
    domain: {
      domainName: input.domainName,
      status: "VERIFIED", // Mock status
      note: "Mocked for sandbox - domain registration not supported"
    }
  };
}
```

---

## Step-by-Step Integration Guide

### Phase 1: Initial Setup (1-2 days)

**Day 1: PayPal Account Configuration**

1. ✅ Create PayPal Business Account
2. ✅ Create Developer Account at developer.paypal.com
3. ✅ Create REST API application (Sandbox)
4. ✅ Note down credentials:
   - Client ID
   - Client Secret
   - Partner Merchant ID
5. ✅ Configure return URL in PayPal App settings
6. ✅ Enable required products and capabilities

**Day 2: Platform Configuration**

1. ✅ Store PayPal credentials in global config
2. ✅ Configure webhook endpoints in Saleor
3. ✅ Test authentication (get access token)
4. ✅ Verify API connectivity

---

### Phase 2: Merchant Onboarding (2-3 days)

**Day 1: Create Referral Flow**

1. ✅ Implement `createPartnerReferral` endpoint
2. ✅ Generate unique tracking IDs
3. ✅ Store tracking IDs in database
4. ✅ Create UI for "Connect PayPal" button
5. ✅ Test referral link generation

**Day 2: Return URL Handling**

1. ✅ Implement return URL page
2. ✅ Poll seller status by tracking ID
3. ✅ Save merchant ID when onboarding completes
4. ✅ Check merchant readiness flags
5. ✅ Show appropriate error messages

**Day 3: Status Dashboard**

1. ✅ Display merchant connection status
2. ✅ Show enabled payment methods
3. ✅ Add "Refresh Status" functionality
4. ✅ Implement "Disconnect" button
5. ✅ Test complete onboarding flow

**Implementation**: `src/modules/ui/merchant-connection/merchant-connection-section.tsx`

---

### Phase 3: Payment Processing (3-4 days)

**Day 1: Order Creation**

1. ✅ Implement `TRANSACTION_INITIALIZE_SESSION` webhook
2. ✅ Create PayPal order with merchant context
3. ✅ Return order ID and approve URL
4. ✅ Test order creation in sandbox

**Day 2: Payment Capture**

1. ✅ Implement `TRANSACTION_CHARGE_REQUESTED` webhook
2. ✅ Capture PayPal order
3. ✅ Extract and save capture ID
4. ✅ Test payment capture flow

**Day 3: Authorization Flow** (Optional)

1. ✅ Implement authorize instead of capture
2. ✅ Add delayed capture functionality
3. ✅ Test authorization expiration

**Day 4: Refunds & Cancellations**

1. ✅ Implement `TRANSACTION_REFUND_REQUESTED` webhook
2. ✅ Support full and partial refunds
3. ✅ Implement `TRANSACTION_CANCELLATION_REQUESTED` webhook
4. ✅ Test refund scenarios

---

### Phase 4: Apple Pay Integration (2-3 days)

**Day 1: Prerequisites**

1. ✅ Verify merchants have `PAYMENT_METHODS` product
2. ✅ Ensure `APPLE_PAY` capability is active
3. ✅ Set up domain association file hosting

**Day 2: Domain Registration**

1. ✅ Implement domain registration endpoint
2. ✅ Create UI for domain management
3. ✅ Test in sandbox (may have limitations)
4. ✅ Add error handling for sandbox

**Day 3: Frontend Integration**

1. ✅ Integrate PayPal JS SDK with Apple Pay component
2. ✅ Handle Apple Pay button rendering
3. ✅ Test Apple Pay payment flow (production only)

**Implementation**: `src/modules/merchant-onboarding/trpc-handlers/register-apple-pay-domain-handler.ts`

---

### Phase 5: Testing & Quality Assurance (2-3 days)

**Day 1: Unit Tests**

1. ✅ Write tests for PayPal API client
2. ✅ Mock PayPal responses
3. ✅ Test error scenarios
4. ✅ Achieve >80% code coverage

**Day 2: Integration Tests**

1. ✅ Test full merchant onboarding flow
2. ✅ Test payment processing end-to-end
3. ✅ Test refund scenarios
4. ✅ Test error handling

**Day 3: Manual Testing**

1. ✅ Create test merchant accounts
2. ✅ Complete onboarding manually
3. ✅ Process test payments
4. ✅ Test all error conditions

---

### Phase 6: Production Deployment (1-2 days)

**Day 1: Production Setup**

1. ✅ Create live PayPal REST app
2. ✅ Get live credentials
3. ✅ Update production configuration
4. ✅ Test authentication in live environment

**Day 2: Go-Live**

1. ✅ Deploy to production
2. ✅ Onboard first live merchant
3. ✅ Process first live payment
4. ✅ Monitor logs and metrics
5. ✅ Set up alerts for errors

---

## Testing in Sandbox

### Create Test Merchant Account

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/accounts)
2. Create new Business account (Sandbox)
3. Note credentials for testing

### Test Onboarding Flow

```bash
# 1. Create referral
POST /api/trpc/merchantOnboarding.createReferral
{
  "merchantEmail": "sandbox-merchant@example.com",
  "country": "US"
}

# 2. Open action_url in browser
# 3. Login with sandbox business account
# 4. Grant permissions to your app
# 5. Complete onboarding

# 6. Check status
GET /api/trpc/merchantOnboarding.getMerchantStatus?trackingId=...
```

### Test Payment Flow

```javascript
// 1. Create order
const order = await createOrder({
  amount: "10.00",
  currency: "USD",
  merchantId: "TEST_MERCHANT_ID"
});

// 2. Approve order (manual step in sandbox)
window.open(order.approveUrl, '_blank');

// 3. Capture payment
const capture = await captureOrder(order.id);

// 4. Refund payment
const refund = await refundCapture(capture.id, {
  amount: "5.00"
});
```

### Sandbox Test Cards

PayPal provides test cards in sandbox:
- **Visa**: 4032034993475953
- **Mastercard**: 5425233430109903
- **Amex**: 374245455400001

**Note**: Use any future expiry date and any 3-digit CVV

---

## Production Deployment

### Pre-Launch Checklist

- [ ] Live PayPal REST app created
- [ ] Live credentials configured
- [ ] Production webhooks registered
- [ ] SSL certificate valid
- [ ] Domain association file hosted (for Apple Pay)
- [ ] Error tracking configured (Sentry)
- [ ] Logging configured (structured logs)
- [ ] Monitoring set up (metrics, alerts)
- [ ] Rate limiting configured
- [ ] Security review completed

### Environment Configuration

```typescript
// Production configuration
const productionConfig = {
  environment: "LIVE",
  clientId: process.env.PAYPAL_LIVE_CLIENT_ID,
  clientSecret: process.env.PAYPAL_LIVE_CLIENT_SECRET,
  partnerMerchantId: process.env.PAYPAL_PARTNER_MERCHANT_ID,
  apiUrl: "https://api-m.paypal.com"
};
```

### Go-Live Steps

1. ✅ Deploy to production environment
2. ✅ Verify webhook endpoints are accessible
3. ✅ Test authentication with live credentials
4. ✅ Onboard 1-2 test merchants
5. ✅ Process small test transactions
6. ✅ Verify refunds work correctly
7. ✅ Monitor error logs for 24 hours
8. ✅ Enable for all merchants

### Monitoring

**Key Metrics to Track**:
- Successful onboarding rate
- Payment success rate
- Payment failure rate (by error type)
- Average transaction time
- Refund success rate
- API error rate (by endpoint)

**Alerting Thresholds**:
- Payment failure rate > 5%
- API error rate > 1%
- Response time > 5 seconds
- Webhook delivery failure

---

## Troubleshooting

### Common Issues

#### 1. Authentication Errors

**Error**: `401 Unauthorized`

**Causes**:
- Invalid client credentials
- Expired access token
- Wrong environment (sandbox vs live)

**Solution**:
```typescript
// Verify credentials
console.log("Client ID:", clientId.substring(0, 8) + "...");
console.log("Environment:", environment);

// Test authentication
const token = await getAccessToken();
console.log("Token obtained:", !!token);
```

---

#### 2. PayPal-Auth-Assertion Errors

**Error**: `403 Forbidden` or `500 Internal Server Error`

**Causes**:
- Missing PayPal-Auth-Assertion header
- Invalid merchant ID in assertion
- Wrong client ID in assertion

**Solution**:
```typescript
// Verify header generation
const assertion = generateAuthAssertion({
  clientId: partnerClientId,
  merchantId: merchantId
});

console.log("Header parts:", {
  header: Buffer.from(assertion.split('.')[0], 'base64').toString(),
  payload: Buffer.from(assertion.split('.')[1], 'base64').toString()
});

// Expected output:
// header: {"alg":"none"}
// payload: {"iss":"partner_client_id","payer_id":"merchant_id"}
```

**Implementation**: `src/modules/paypal/paypal-client.ts:59`

---

#### 3. Merchant Not Ready

**Error**: Payment fails with merchant account issue

**Causes**:
- Email not confirmed (`primary_email_confirmed: false`)
- Account restricted (`payments_receivable: false`)
- Permissions not granted (`oauth_integrations` empty)

**Solution**:
```typescript
// Check merchant status
const status = await getSellerStatus(merchantId);

if (!status.primary_email_confirmed) {
  // Merchant needs to confirm email
  return "MERCHANT_EMAIL_NOT_CONFIRMED";
}

if (!status.payments_receivable) {
  // Merchant account has restrictions
  return "MERCHANT_ACCOUNT_RESTRICTED";
}

if (!status.oauth_integrations?.length) {
  // Merchant needs to re-grant permissions
  return "MERCHANT_PERMISSIONS_REVOKED";
}
```

---

#### 4. Apple Pay Domain Registration Fails

**Error**: `500 Internal Server Error` from `/v1/customer/wallet-domains`

**Causes**:
- Limited sandbox support
- Merchant doesn't have APPLE_PAY capability
- Domain verification file not accessible

**Solution**:
```typescript
// 1. Check merchant has Apple Pay enabled
const status = await getSellerStatus(merchantId);
const applePay = status.capabilities?.find(c => c.name === "APPLE_PAY");

if (applePay?.status !== "ACTIVE") {
  throw new Error("Merchant needs APPLE_PAY capability active");
}

// 2. Verify domain file is accessible
const response = await fetch(
  `https://${domainName}/.well-known/apple-developer-merchant-id-domain-association`
);

if (!response.ok) {
  throw new Error("Domain association file not accessible");
}

// 3. Check content-type
if (response.headers.get('content-type') !== 'application/octet-stream') {
  throw new Error("Wrong content-type for domain association file");
}
```

**Sandbox Workaround**: Contact PayPal support or test in production

---

#### 5. Order Capture Fails

**Error**: Order cannot be captured

**Causes**:
- Order not approved by customer
- Order already captured
- Order expired

**Solution**:
```typescript
// Check order status first
const order = await getOrder(orderId);

if (order.status === "COMPLETED") {
  throw new Error("Order already captured");
}

if (order.status !== "APPROVED") {
  throw new Error(`Order status: ${order.status} - must be APPROVED`);
}

// Then capture
const result = await captureOrder(orderId);
```

---

#### 6. Refund Fails

**Error**: Cannot refund transaction

**Causes**:
- Capture ID not found
- Already fully refunded
- Partial refund exceeds available amount

**Solution**:
```typescript
// Get capture details first
const capture = await getCapture(captureId);

// Check available refund amount
const captured = parseFloat(capture.amount.value);
const refunded = parseFloat(capture.seller_receivable_breakdown?.total_refunded_amount?.value || "0");
const available = captured - refunded;

if (refundAmount > available) {
  throw new Error(`Cannot refund ${refundAmount}. Available: ${available}`);
}
```

---

### Debug Logging

Enable detailed logging:

```typescript
// Set environment variable
DEBUG=paypal:*

// In code
import { createLogger } from "@/lib/logger";

const logger = createLogger("PayPalDebug");

logger.debug("Request details", {
  method: "POST",
  path: "/v2/checkout/orders",
  merchantId: merchantId,
  body: JSON.stringify(requestBody, null, 2)
});
```

**Implementation**: Uses structured logging throughout codebase

---

### PayPal Debug IDs

Every PayPal API error includes a `debug_id`. Save this for support:

```typescript
try {
  await paypalApi.captureOrder(orderId);
} catch (error) {
  const debugId = error.details?.debug_id;
  logger.error("PayPal API error", {
    debugId: debugId, // e.g., "f2930644762a2"
    message: error.message,
    statusCode: error.statusCode
  });

  // Include in user-facing error
  throw new Error(
    `Payment failed. Please contact support with reference: ${debugId}`
  );
}
```

---

## API Endpoint Quick Reference

### Authentication
| Endpoint | Method | Purpose | Merchant Context |
|----------|--------|---------|------------------|
| `/v1/oauth2/token` | POST | Get access token | No |

### Merchant Onboarding
| Endpoint | Method | Purpose | Merchant Context |
|----------|--------|---------|------------------|
| `/v2/customer/partner-referrals` | POST | Create merchant onboarding link | No |
| `/v1/customer/partners/{partner_id}/merchant-integrations/{merchant_id}` | GET | Get merchant status by ID | No |
| `/v1/customer/partners/{partner_id}/merchant-integrations?tracking_id={id}` | GET | Get merchant status by tracking ID | No |

### Payment Processing
| Endpoint | Method | Purpose | Merchant Context |
|----------|--------|---------|------------------|
| `/v2/checkout/orders` | POST | Create payment order | Yes |
| `/v2/checkout/orders/{id}/capture` | POST | Capture approved order | Yes |
| `/v2/checkout/orders/{id}/authorize` | POST | Authorize payment | Yes |
| `/v2/checkout/orders/{id}` | GET | Get order details | Yes |
| `/v2/payments/captures/{id}/refund` | POST | Refund captured payment | Yes |

### Apple Pay
| Endpoint | Method | Purpose | Merchant Context |
|----------|--------|---------|------------------|
| `/v1/customer/wallet-domains` | POST | Register domain for Apple Pay | Yes |
| `/v1/customer/wallet-domains` | GET | List registered domains | Yes |
| `/v1/customer/unregister-wallet-domain` | POST | Unregister domain | Yes |

**Merchant Context** = Requires `PayPal-Auth-Assertion` header with merchant ID

---

## Summary

This guide covered:

✅ All PayPal API endpoints used in the integration
✅ Complete merchant onboarding flow
✅ Payment processing implementation
✅ Apple Pay domain registration
✅ Step-by-step integration timeline
✅ Testing procedures
✅ Production deployment checklist
✅ Troubleshooting common issues

**Total Implementation Time**: 2-3 weeks for complete integration

**Key Success Factors**:
1. Proper merchant onboarding validation
2. Correct PayPal-Auth-Assertion header generation
3. Comprehensive error handling
4. Detailed logging and monitoring
5. Thorough testing in sandbox before production

---

## Documentation References

This implementation guide was compiled from the following official PayPal and project documentation sources:

### PayPal Official Documentation

1. **PayPal Multiparty (Complete Payments) Documentation**
   - Main Guide: [https://developer.paypal.com/docs/multiparty/](https://developer.paypal.com/docs/multiparty/)
   - Used for: Overall architecture and multiparty integration patterns

2. **Apple Pay Integration for Multiparty**
   - Domain Registration: [https://developer.paypal.com/docs/multiparty/checkout/apm/apple-pay/#set-up-your-testing-environment](https://developer.paypal.com/docs/multiparty/checkout/apm/apple-pay/#set-up-your-testing-environment)
   - Integration Guide: [https://developer.paypal.com/docs/multiparty/checkout/apm/apple-pay/#integrate-apple-pay-checkout](https://developer.paypal.com/docs/multiparty/checkout/apm/apple-pay/#integrate-apple-pay-checkout)
   - Setup Instructions: [https://developer.paypal.com/docs/multiparty/checkout/apm/apple-pay/#set-up-your-apple-pay-button](https://developer.paypal.com/docs/multiparty/checkout/apm/apple-pay/#set-up-your-apple-pay-button)
   - Session Creation: [https://developer.paypal.com/docs/multiparty/checkout/apm/apple-pay/#create-apple-pay-session](https://developer.paypal.com/docs/multiparty/checkout/apm/apple-pay/#create-apple-pay-session)
   - Payment Sheet: [https://developer.paypal.com/docs/multiparty/checkout/apm/apple-pay/#show-the-payment-sheet](https://developer.paypal.com/docs/multiparty/checkout/apm/apple-pay/#show-the-payment-sheet)
   - Testing: [https://developer.paypal.com/docs/multiparty/checkout/apm/apple-pay/#test-your-integration](https://developer.paypal.com/docs/multiparty/checkout/apm/apple-pay/#test-your-integration)
   - Used for: Apple Pay domain registration endpoints and requirements

3. **PayPal REST API Reference**
   - Orders API v2: [https://developer.paypal.com/docs/api/orders/v2/](https://developer.paypal.com/docs/api/orders/v2/)
   - Payments API: [https://developer.paypal.com/docs/api/payments/v2/](https://developer.paypal.com/docs/api/payments/v2/)
   - Partner Referrals: [https://developer.paypal.com/docs/api/partner-referrals/v2/](https://developer.paypal.com/docs/api/partner-referrals/v2/)
   - Used for: Detailed API specifications and request/response formats

4. **PayPal Authentication**
   - OAuth 2.0 Guide: [https://developer.paypal.com/api/rest/authentication/](https://developer.paypal.com/api/rest/authentication/)
   - PayPal-Auth-Assertion Header: [https://developer.paypal.com/docs/api/reference/api-requests/#paypal-auth-assertion](https://developer.paypal.com/docs/api/reference/api-requests/#paypal-auth-assertion)
   - Used for: Authentication flows and header formats

### Project Documentation

5. **Web Shop Manager - Integration Guide (PDF)**
   - Source: `Web Shop Manager - Integration Guide.pdf`
   - Pages Referenced:
     - Page 3-4: Introduction and BN Code
     - Page 4: Auth Assertion Header
     - Page 5-8: Onboarding Overview and Best Practices
     - Page 7: Apple Pay Readiness Criteria
     - Page 9-11: Payment Integration Flow
     - Page 12-15: Payment Methods (PayPal, Venmo, Pay Later, Card Fields, Apple Pay, Google Pay)
     - Page 16-24: Vaulting Implementation
     - Page 25-26: Reporting and Best Practices
   - Used for: Platform-specific requirements and merchant readiness criteria

6. **PayPal Complete Payments Overview**
   - [https://developer.paypal.com/docs/commerce-platforms/](https://developer.paypal.com/docs/commerce-platforms/)
   - Used for: Commerce platform integration patterns

### Implementation Details

All API endpoint paths, request/response formats, and authentication methods documented in this guide are directly sourced from the official PayPal REST API documentation and verified against the Web Shop Manager integration specification.

**Key Endpoint Sources**:
- OAuth Token: [PayPal Authentication Docs](https://developer.paypal.com/api/rest/authentication/)
- Partner Referrals: [Partner Referrals API](https://developer.paypal.com/docs/api/partner-referrals/v2/)
- Orders API: [Orders API v2](https://developer.paypal.com/docs/api/orders/v2/)
- Refunds API: [Payments API](https://developer.paypal.com/docs/api/payments/v2/)
- Wallet Domains: [Apple Pay Multiparty Docs](https://developer.paypal.com/docs/multiparty/checkout/apm/apple-pay/)

### Additional Resources

- **PayPal Developer Portal**: [https://developer.paypal.com/](https://developer.paypal.com/)
- **PayPal Developer Dashboard**: [https://developer.paypal.com/dashboard/](https://developer.paypal.com/dashboard/)
- **PayPal API Status**: [https://www.paypal-status.com/](https://www.paypal-status.com/)
- **PayPal Developer Community**: [https://www.paypal-community.com/](https://www.paypal-community.com/)
- **Saleor Payment Apps**: [https://docs.saleor.io/docs/3.x/developer/payments/payment-apps](https://docs.saleor.io/docs/3.x/developer/payments/payment-apps)

### Version Information

- **PayPal API Version**: REST API v2 (Orders, Payments)
- **Partner Referrals Version**: v2
- **Wallet Domains Version**: v1
- **Documentation Last Updated**: November 2025
- **Saleor Version**: >=3.21 <4

---

## Support

For additional support:

1. **PayPal Technical Support**
   - Developer Support: [https://developer.paypal.com/support/](https://developer.paypal.com/support/)
   - Include debug IDs from error logs when submitting tickets

2. **PayPal Community Forums**
   - [https://www.paypal-community.com/t5/Sandbox-Environment/bd-p/Sandbox-Environment](https://www.paypal-community.com/t5/Sandbox-Environment/bd-p/Sandbox-Environment)
   - Search existing discussions or post new questions

3. **Saleor Support**
   - Saleor Apps Repository: [https://github.com/saleor/apps](https://github.com/saleor/apps)
   - Saleor Discord Community

4. **Project-Specific Support**
   - See main repository README for contribution guidelines
   - Check existing issues before creating new ones
