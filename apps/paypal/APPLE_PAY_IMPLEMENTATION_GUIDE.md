# Apple Pay Implementation Guide

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Apple Pay Endpoints](#apple-pay-endpoints)
4. [Step-by-Step Implementation](#step-by-step-implementation)
5. [Frontend Integration](#frontend-integration)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)
8. [Documentation References](#documentation-references)

---

## Overview

Apple Pay integration through PayPal's Complete Payments platform allows merchants to accept Apple Pay payments on their web and mobile applications. This guide covers the complete implementation process including domain registration, payment processing, and troubleshooting.

### Key Features
- Seamless Apple Pay checkout experience
- Domain verification and management
- Multi-device support (iPhone, iPad, Mac, Apple Watch)
- Secure tokenized payments
- Partner fee collection support

---

## Prerequisites

### 1. Merchant Requirements

Before implementing Apple Pay, ensure the merchant has:

1. **Active PayPal Business Account**
   - Account must be in good standing
   - Business verification completed

2. **Apple Pay Capability Enabled**
   - Contact PayPal support to enable APPLE_PAY capability
   - Verify capability using the `/v2/customer/partners/{partner-id}/merchant-integrations/{merchant-id}` endpoint
   - Check for `APPLE_PAY` in the `capabilities` array

3. **HTTPS Domain**
   - All domains must be accessible via HTTPS
   - Valid SSL/TLS certificate required
   - Domain must be publicly accessible for Apple's verification

4. **Required Products Active**
   ```json
   {
     "products": [
       {
         "name": "PPCP_CUSTOM",
         "vetting_status": "SUBSCRIBED"
       },
       {
         "name": "APPLE_PAY",
         "vetting_status": "SUBSCRIBED"
       }
     ]
   }
   ```

### 2. Technical Requirements

- PayPal Partner Account with Partner Merchant ID
- Client ID and Client Secret (Partner credentials)
- Merchant's PayPal Merchant ID (obtained after onboarding)
- SSL/TLS certificate for your domain
- Apple Developer Account (for native iOS apps)

---

## Apple Pay Endpoints

### 1. Register Apple Pay Domain

**Purpose**: Register a domain with Apple Pay to enable Apple Pay buttons on your storefront.

**Endpoint**: `POST /v1/customer/wallet-domains`

**Authentication**:
- Bearer token (OAuth 2.0)
- PayPal-Auth-Assertion header (required for partner context)

**Request Format**:
```json
{
  "provider_type": "APPLE_PAY",
  "domain": {
    "name": "example.com"
  }
}
```

**Response Format**:
```json
{
  "provider_type": "APPLE_PAY",
  "domain": {
    "name": "example.com"
  },
  "status": "VERIFIED",
  "links": [
    {
      "href": "https://api.paypal.com/v1/customer/wallet-domains",
      "rel": "self",
      "method": "GET"
    }
  ]
}
```

**Status Values**:
- `VERIFIED`: Domain successfully verified by Apple
- `PENDING`: Verification in progress
- `DENIED`: Verification failed

**Implementation**:
```typescript
// Located in: src/modules/paypal/partner-referrals/paypal-partner-referrals-api.ts
async registerApplePayDomain(
  merchantId: PayPalMerchantId,
  request: RegisterApplePayDomainRequest
): Promise<Result<RegisterApplePayDomainResponse, PayPalApiError>> {
  try {
    const response = await this.client.makeRequest<RegisterApplePayDomainResponse>({
      method: "POST",
      path: "/v1/customer/wallet-domains",
      body: request,
    });

    logger.info("Apple Pay domain registered successfully", {
      merchant_id: merchantId,
      domain_name: request.domain.name,
      status: response.status,
    });

    return ok(response);
  } catch (error) {
    logger.error("Failed to register Apple Pay domain", {
      merchant_id: merchantId,
      domain_name: request.domain.name,
      error,
    });
    return err(this.handleApiError(error));
  }
}
```

**Handler Location**: `src/modules/merchant-onboarding/trpc-handlers/register-apple-pay-domain-handler.ts`

**When to Use**:
- During merchant onboarding after Apple Pay capability is confirmed
- When adding new storefronts or subdomains
- Before showing Apple Pay buttons to customers

---

### 2. Get Apple Pay Domains

**Purpose**: Retrieve all registered Apple Pay domains for a merchant to display in admin UI and verify domain status.

**Endpoint**: `GET /v1/customer/wallet-domains`

**Authentication**:
- Bearer token (OAuth 2.0)
- PayPal-Auth-Assertion header (required for partner context)

**Query Parameters**: None

**Response Format**:
```json
{
  "domains": [
    {
      "provider_type": "APPLE_PAY",
      "domain": {
        "name": "example.com"
      },
      "status": "VERIFIED",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:35:00Z",
      "links": [
        {
          "href": "https://api.paypal.com/v1/customer/unregister-wallet-domain",
          "rel": "delete",
          "method": "POST"
        }
      ]
    },
    {
      "provider_type": "APPLE_PAY",
      "domain": {
        "name": "store.example.com"
      },
      "status": "PENDING",
      "created_at": "2024-01-16T14:20:00Z",
      "updated_at": "2024-01-16T14:20:00Z"
    }
  ]
}
```

**Implementation**:
```typescript
// Located in: src/modules/paypal/partner-referrals/paypal-partner-referrals-api.ts
async getApplePayDomains(
  merchantId: PayPalMerchantId
): Promise<Result<GetApplePayDomainsResponse, PayPalApiError>> {
  try {
    const response = await this.client.makeRequest<GetApplePayDomainsResponse>({
      method: "GET",
      path: "/v1/customer/wallet-domains",
    });

    logger.info("Apple Pay domains retrieved successfully", {
      merchant_id: merchantId,
      domains_count: response.domains?.length || 0,
    });

    return ok(response);
  } catch (error) {
    logger.error("Failed to get Apple Pay domains", {
      merchant_id: merchantId,
      error,
    });
    return err(this.handleApiError(error));
  }
}
```

**Handler Location**: `src/modules/merchant-onboarding/trpc-handlers/get-apple-pay-domains-handler.ts`

**When to Use**:
- Loading merchant admin UI to display registered domains
- Checking domain verification status
- Validating domain configuration before payment processing

---

### 3. Delete Apple Pay Domain

**Purpose**: Unregister a domain from Apple Pay when it's no longer needed or when migrating to a new domain.

**Endpoint**: `POST /v1/customer/unregister-wallet-domain`

**Authentication**:
- Bearer token (OAuth 2.0)
- PayPal-Auth-Assertion header (required for partner context)

**Request Format**:
```json
{
  "provider_type": "APPLE_PAY",
  "domain": {
    "name": "example.com"
  }
}
```

**Response**: `204 No Content` (success)

**Implementation**:
```typescript
// Located in: src/modules/paypal/partner-referrals/paypal-partner-referrals-api.ts
async deleteApplePayDomain(
  merchantId: PayPalMerchantId,
  domainName: string
): Promise<Result<void, PayPalApiError>> {
  try {
    await this.client.makeRequest<void>({
      method: "POST",
      path: "/v1/customer/unregister-wallet-domain",
      body: {
        provider_type: "APPLE_PAY",
        domain: {
          name: domainName,
        },
      },
    });

    logger.info("Apple Pay domain deleted successfully", {
      merchant_id: merchantId,
      domain_name: domainName,
    });

    return ok(undefined);
  } catch (error) {
    logger.error("Failed to delete Apple Pay domain", {
      merchant_id: merchantId,
      domain_name: domainName,
      error,
    });
    return err(this.handleApiError(error));
  }
}
```

**Handler Location**: `src/modules/merchant-onboarding/trpc-handlers/delete-apple-pay-domain-handler.ts`

**When to Use**:
- Removing old or unused domains
- Domain migration or rebranding
- Cleaning up test domains after development

---

### 4. Create Order with Apple Pay

**Purpose**: Create a PayPal order with Apple Pay as the payment source.

**Endpoint**: `POST /v2/checkout/orders`

**Authentication**:
- Bearer token (OAuth 2.0)
- PayPal-Auth-Assertion header (required for partner context)
- PayPal-Partner-Attribution-Id header (BN code)

**Request Format**:
```json
{
  "intent": "CAPTURE",
  "purchase_units": [
    {
      "reference_id": "ORDER-123",
      "amount": {
        "currency_code": "USD",
        "value": "100.00",
        "breakdown": {
          "item_total": {
            "currency_code": "USD",
            "value": "85.00"
          },
          "shipping": {
            "currency_code": "USD",
            "value": "10.00"
          },
          "tax_total": {
            "currency_code": "USD",
            "value": "5.00"
          }
        }
      },
      "items": [
        {
          "name": "Product Name",
          "quantity": "1",
          "unit_amount": {
            "currency_code": "USD",
            "value": "85.00"
          }
        }
      ],
      "shipping": {
        "name": {
          "full_name": "John Doe"
        },
        "address": {
          "address_line_1": "123 Main St",
          "admin_area_2": "San Jose",
          "admin_area_1": "CA",
          "postal_code": "95131",
          "country_code": "US"
        }
      }
    }
  ],
  "payment_source": {
    "apple_pay": {
      "id": "APPLE_PAY_TOKEN_FROM_APPLE_PAY_SESSION",
      "name": "John Doe",
      "email_address": "john.doe@example.com",
      "phone_number": {
        "national_number": "4085551234"
      },
      "decrypted_token": {
        "transaction_amount": {
          "currency_code": "USD",
          "value": "100.00"
        },
        "tokenized_card": {
          "name": "John Doe",
          "type": "CREDIT",
          "last_digits": "1234",
          "expiry": "2025-12"
        },
        "device_manufacturer_id": "APPLE_DEVICE_ID",
        "payment_data_type": "3D_SECURE",
        "payment_data": {
          "cryptogram": "ENCRYPTED_CRYPTOGRAM",
          "eci_indicator": "05"
        }
      }
    }
  },
  "application_context": {
    "brand_name": "Your Store Name",
    "locale": "en-US",
    "landing_page": "NO_PREFERENCE",
    "shipping_preference": "SET_PROVIDED_ADDRESS",
    "user_action": "PAY_NOW"
  }
}
```

**Response Format**:
```json
{
  "id": "5O190127TN364715T",
  "status": "COMPLETED",
  "payment_source": {
    "apple_pay": {
      "name": "John Doe",
      "email_address": "john.doe@example.com",
      "card_last_digits": "1234",
      "card_type": "CREDIT"
    }
  },
  "purchase_units": [
    {
      "reference_id": "ORDER-123",
      "payments": {
        "captures": [
          {
            "id": "3C679366H7513463N",
            "status": "COMPLETED",
            "amount": {
              "currency_code": "USD",
              "value": "100.00"
            },
            "final_capture": true,
            "seller_protection": {
              "status": "ELIGIBLE"
            },
            "create_time": "2024-01-15T10:30:00Z",
            "update_time": "2024-01-15T10:30:05Z"
          }
        ]
      }
    }
  ]
}
```

**Implementation Location**:
- Frontend: Storefront checkout component (Apple Pay button handler)
- Backend: `src/app/api/webhooks/saleor/payment-gateway-initialize-session/use-case.ts`

**When to Use**:
- When customer completes Apple Pay authorization on frontend
- After receiving Apple Pay token from Apple Pay session
- During checkout flow when Apple Pay is selected as payment method

---

### 5. Get Merchant Capabilities

**Purpose**: Check if merchant has Apple Pay enabled and what other capabilities are available.

**Endpoint**: `GET /v2/customer/partners/{partner-id}/merchant-integrations/{merchant-id}`

**Authentication**:
- Bearer token (OAuth 2.0)
- PayPal-Auth-Assertion header (required for partner context)

**Response Format**:
```json
{
  "merchant_id": "MERCHANT123",
  "tracking_id": "unique-tracking-id",
  "products": [
    {
      "name": "PPCP_STANDARD",
      "vetting_status": "SUBSCRIBED",
      "capabilities": [
        "APPLE_PAY",
        "GOOGLE_PAY",
        "CUSTOM_CARD_PROCESSING",
        "PAYPAL_WALLET"
      ]
    }
  ],
  "capabilities": [
    {
      "name": "APPLE_PAY",
      "status": "ACTIVE"
    },
    {
      "name": "GOOGLE_PAY",
      "status": "ACTIVE"
    },
    {
      "name": "CUSTOM_CARD_PROCESSING",
      "status": "ACTIVE"
    }
  ],
  "payments_receivable": true,
  "primary_email_confirmed": true,
  "oauth_integrations": [
    {
      "integration_type": "OAUTH_THIRD_PARTY",
      "integration_method": "PAYPAL",
      "oauth_third_party": [
        {
          "partner_client_id": "YOUR_PARTNER_CLIENT_ID",
          "merchant_client_id": "MERCHANT_CLIENT_ID"
        }
      ]
    }
  ]
}
```

**Implementation Location**:
- `src/modules/paypal/partner-referrals/paypal-partner-referrals-api.ts` (getMerchantStatus method)
- `src/modules/merchant-onboarding/trpc-handlers/get-merchant-status-handler.ts`

**When to Use**:
- After merchant completes PayPal onboarding
- Before showing Apple Pay domain registration UI
- To verify merchant readiness for Apple Pay
- Periodic checks to monitor capability status

---

## Step-by-Step Implementation

### Phase 1: Merchant Onboarding (1-2 days)

#### Step 1: Create Partner Referral

Generate onboarding URL for merchant to connect their PayPal account:

```typescript
// Generate referral URL with Apple Pay capability requested
const referralUrl = await partnerApi.generatePartnerReferral({
  tracking_id: "unique-merchant-id",
  operations: [
    {
      operation: "API_INTEGRATION",
      api_integration_preference: {
        rest_api_integration: {
          integration_method: "PAYPAL",
          integration_type: "THIRD_PARTY",
          third_party_details: {
            features: [
              "PAYMENT",
              "REFUND",
              "PARTNER_FEE",
              "APPLE_PAY"  // Request Apple Pay capability
            ]
          }
        }
      }
    }
  ],
  products: ["EXPRESS_CHECKOUT"],
  legal_consents: [
    {
      type: "SHARE_DATA_CONSENT",
      granted: true
    }
  ],
  partner_config_override: {
    return_url: "https://your-platform.com/paypal/onboarding/return",
    return_url_description: "Return to platform",
    show_add_credit_card: true
  }
});

// Redirect merchant to: referralUrl.action_url
```

**Handler**: `src/modules/merchant-onboarding/trpc-handlers/generate-partner-referral-handler.ts`

#### Step 2: Handle Onboarding Return

After merchant completes onboarding, PayPal redirects to your return URL with merchant credentials:

```typescript
// Parse return URL parameters
const merchantIdInPayPal = params.get("merchantIdInPayPal");
const permissionsGranted = params.get("permissionsGranted") === "true";
const accountStatus = params.get("accountStatus");
const consentStatus = params.get("consentStatus") === "true";

// Store merchant information in database
await repository.save({
  trackingId,
  saleorApiUrl,
  paypalMerchantId: merchantIdInPayPal,
  onboardingStatus: accountStatus,
  permissionsGranted,
  consentStatus,
});
```

#### Step 3: Get Merchant Capabilities

Check if Apple Pay is enabled:

```typescript
const statusResult = await partnerApi.getMerchantStatus(merchantId);

if (statusResult.isErr()) {
  throw new Error("Failed to get merchant status");
}

const status = statusResult.value;

// Check for Apple Pay capability
const hasApplePay = status.capabilities?.some(
  cap => cap.name === "APPLE_PAY" && cap.status === "ACTIVE"
);

// Store in database
await repository.update(trackingId, {
  applePayEnabled: hasApplePay,
  capabilities: status.capabilities,
});
```

**Handler**: `src/modules/merchant-onboarding/trpc-handlers/get-merchant-status-handler.ts`

---

### Phase 2: Domain Registration (1 day)

#### Step 1: Register Domain

After confirming Apple Pay capability, register merchant's storefront domain:

```typescript
// Register domain with Apple Pay
const result = await partnerApi.registerApplePayDomain(merchantId, {
  provider_type: "APPLE_PAY",
  domain: {
    name: "store.example.com"
  }
});

if (result.isErr()) {
  console.error("Failed to register domain:", result.error);
  throw new Error(result.error.paypalErrorMessage);
}

// Domain registered, check status
console.log("Domain status:", result.value.status);
// Status will be: VERIFIED, PENDING, or DENIED
```

**Handler**: `src/modules/merchant-onboarding/trpc-handlers/register-apple-pay-domain-handler.ts`

**UI Component**: `src/modules/ui/merchant-connection/apple-pay-domains-section.tsx`

#### Step 2: Verify Domain Status

Poll or check domain status:

```typescript
// Get all registered domains
const domainsResult = await partnerApi.getApplePayDomains(merchantId);

if (domainsResult.isErr()) {
  throw new Error("Failed to get domains");
}

const domains = domainsResult.value.domains || [];

// Check specific domain status
const domain = domains.find(d => d.domain.name === "store.example.com");

if (domain) {
  switch (domain.status) {
    case "VERIFIED":
      console.log("✓ Domain verified and ready for Apple Pay");
      break;
    case "PENDING":
      console.log("⏳ Verification in progress");
      break;
    case "DENIED":
      console.error("✗ Verification failed");
      break;
  }
}
```

**Handler**: `src/modules/merchant-onboarding/trpc-handlers/get-apple-pay-domains-handler.ts`

#### Step 3: Domain Management UI

Display registered domains in merchant admin:

```tsx
// Located in: src/modules/ui/merchant-connection/apple-pay-domains-section.tsx
<ApplePayDomainsSection
  trackingId={merchant.trackingId}
  applePayEnabled={merchant.applePayEnabled}
/>
```

Features:
- Display list of registered domains with status badges
- Add new domain form with validation
- Delete domain confirmation
- Error and success messaging
- Loading states

---

### Phase 3: Frontend Integration (2-3 days)

#### Step 1: Add Apple Pay Button

Add Apple Pay button to checkout page (must be on registered HTTPS domain):

```typescript
// Check Apple Pay availability
if (window.ApplePaySession && ApplePaySession.canMakePayments()) {
  // Show Apple Pay button
  showApplePayButton();
}

// Apple Pay button HTML
<button
  className="apple-pay-button"
  onClick={handleApplePayClick}
  style={{
    display: "inline-block",
    WebkitAppearance: "-apple-pay-button",
    applePayButtonStyle: "black",
    applePayButtonType: "buy"
  }}
/>
```

#### Step 2: Initialize Apple Pay Session

When customer clicks Apple Pay button:

```typescript
const handleApplePayClick = async () => {
  // 1. Define payment request
  const paymentRequest = {
    countryCode: 'US',
    currencyCode: 'USD',
    total: {
      label: 'Your Store Name',
      amount: '100.00',
      type: 'final'
    },
    lineItems: [
      {
        label: 'Product Name',
        amount: '85.00',
        type: 'final'
      },
      {
        label: 'Shipping',
        amount: '10.00',
        type: 'final'
      },
      {
        label: 'Tax',
        amount: '5.00',
        type: 'final'
      }
    ],
    supportedNetworks: ['visa', 'mastercard', 'amex', 'discover'],
    merchantCapabilities: ['supports3DS']
  };

  // 2. Create Apple Pay session
  const session = new ApplePaySession(10, paymentRequest);

  // 3. Merchant validation
  session.addEventListener('validatemerchant', async (event) => {
    try {
      // Call your backend to get merchant session
      const merchantSession = await fetch('/api/apple-pay/validate-merchant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          validationURL: event.validationURL
        })
      }).then(r => r.json());

      session.completeMerchantValidation(merchantSession);
    } catch (error) {
      console.error('Merchant validation failed:', error);
      session.abort();
    }
  };

  // 4. Payment authorization
  session.addEventListener('paymentauthorized', async (event) => {
    try {
      // Send payment token to PayPal
      const result = await createPayPalOrderWithApplePay(event.payment);

      if (result.success) {
        session.completePayment(ApplePaySession.STATUS_SUCCESS);
        // Redirect to success page
        window.location.href = '/checkout/success?orderId=' + result.orderId;
      } else {
        session.completePayment(ApplePaySession.STATUS_FAILURE);
      }
    } catch (error) {
      console.error('Payment authorization failed:', error);
      session.completePayment(ApplePaySession.STATUS_FAILURE);
    }
  };

  // 5. Error handling
  session.oncancel = (event) => {
    console.log('Payment cancelled by user');
  };

  // 6. Start session
  session.begin();
};
```

#### Step 3: Backend Merchant Validation

Create endpoint to validate merchant session:

```typescript
// POST /api/apple-pay/validate-merchant
export async function POST(request: Request) {
  const { validationURL } = await request.json();

  try {
    // Call Apple's validation endpoint
    const response = await fetch(validationURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        merchantIdentifier: 'merchant.com.example',
        domainName: 'store.example.com',
        displayName: 'Your Store Name'
      })
    });

    const merchantSession = await response.json();
    return Response.json(merchantSession);
  } catch (error) {
    console.error('Merchant validation failed:', error);
    return Response.json(
      { error: 'Merchant validation failed' },
      { status: 500 }
    );
  }
}
```

#### Step 4: Create PayPal Order with Apple Pay Token

```typescript
async function createPayPalOrderWithApplePay(payment) {
  const response = await fetch('/api/paypal/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      paymentSource: 'apple_pay',
      applePayToken: payment.token,
      amount: payment.total.amount,
      shippingContact: payment.shippingContact,
      billingContact: payment.billingContact
    })
  });

  return response.json();
}
```

---

### Phase 4: Payment Processing (2 days)

#### Order Creation

```typescript
// Backend: Create order with Apple Pay payment source
const orderResult = await paypalClient.makeRequest({
  method: "POST",
  path: "/v2/checkout/orders",
  body: {
    intent: "CAPTURE",
    purchase_units: [{
      reference_id: saleorOrderId,
      amount: {
        currency_code: "USD",
        value: "100.00",
        breakdown: {
          item_total: { currency_code: "USD", value: "85.00" },
          shipping: { currency_code: "USD", value: "10.00" },
          tax_total: { currency_code: "USD", value: "5.00" }
        }
      },
      items: cartItems,
      shipping: shippingAddress
    }],
    payment_source: {
      apple_pay: {
        id: applePayToken.paymentData,
        name: `${payment.billingContact.givenName} ${payment.billingContact.familyName}`,
        email_address: payment.shippingContact.emailAddress,
        phone_number: {
          national_number: payment.shippingContact.phoneNumber
        },
        decrypted_token: {
          transaction_amount: {
            currency_code: "USD",
            value: "100.00"
          },
          tokenized_card: {
            name: payment.billingContact.givenName,
            type: "CREDIT",
            last_digits: applePayToken.paymentMethod.displayName.slice(-4)
          },
          device_manufacturer_id: applePayToken.transactionIdentifier,
          payment_data_type: "3DSECURE",
          payment_data: {
            cryptogram: applePayToken.paymentData.data,
            eci_indicator: "05"
          }
        }
      }
    },
    application_context: {
      brand_name: "Your Store",
      locale: "en-US",
      user_action: "PAY_NOW"
    }
  }
});
```

**Implementation**: `src/app/api/webhooks/saleor/payment-gateway-initialize-session/use-case.ts`

---

### Phase 5: Testing (2-3 days)

#### Sandbox Testing

1. **Test Domain Registration**:
   ```bash
   # Check if domain is registered
   curl -X GET https://api.sandbox.paypal.com/v1/customer/wallet-domains \
     -H "Authorization: Bearer ACCESS_TOKEN" \
     -H "PayPal-Auth-Assertion: BASE64_ASSERTION"
   ```

2. **Test Apple Pay Button**:
   - Use Safari browser (required for Apple Pay)
   - Add test credit card to Apple Wallet
   - Click Apple Pay button on registered domain
   - Complete Face ID / Touch ID authentication

3. **Test Payment Flow**:
   - Create test order with small amount ($1.00)
   - Complete Apple Pay authorization
   - Verify order captured in PayPal sandbox
   - Check webhook notifications

#### Common Test Scenarios

| Scenario | Expected Result |
|----------|----------------|
| Domain not registered | Apple Pay button doesn't show |
| Invalid domain (not HTTPS) | Domain registration fails |
| Domain verification pending | Apple Pay button shows but may fail |
| Apple Pay declined | Payment fails gracefully |
| Successful payment | Order completes, webhook sent |
| Refund request | Refund processes successfully |

---

## Frontend Integration

### Complete React Component Example

```tsx
// ApplePayButton.tsx
import { useState, useEffect } from 'react';

interface ApplePayButtonProps {
  amount: string;
  currency: string;
  onSuccess: (orderId: string) => void;
  onError: (error: Error) => void;
}

export const ApplePayButton = ({
  amount,
  currency,
  onSuccess,
  onError
}: ApplePayButtonProps) => {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    // Check if Apple Pay is available
    if (window.ApplePaySession && ApplePaySession.canMakePayments()) {
      setAvailable(true);
    }
  }, []);

  const handleApplePayClick = async () => {
    try {
      const paymentRequest = {
        countryCode: 'US',
        currencyCode: currency,
        total: {
          label: 'Your Store',
          amount: amount,
          type: 'final'
        },
        supportedNetworks: ['visa', 'mastercard', 'amex', 'discover'],
        merchantCapabilities: ['supports3DS']
      };

      const session = new ApplePaySession(10, paymentRequest);

      // Merchant validation
      session.addEventListener('validatemerchant', async (event) => {
        const merchantSession = await fetch('/api/apple-pay/validate-merchant', {
          method: 'POST',
          body: JSON.stringify({ validationURL: event.validationURL })
        }).then(r => r.json());

        session.completeMerchantValidation(merchantSession);
      };

      // Payment authorization
      session.addEventListener('paymentauthorized', async (event) => {
        const result = await fetch('/api/paypal/create-order', {
          method: 'POST',
          body: JSON.stringify({
            payment: event.payment,
            amount,
            currency
          })
        }).then(r => r.json());

        if (result.success) {
          session.completePayment(ApplePaySession.STATUS_SUCCESS);
          onSuccess(result.orderId);
        } else {
          session.completePayment(ApplePaySession.STATUS_FAILURE);
          onError(new Error(result.error));
        }
      };

      session.begin();
    } catch (error) {
      onError(error as Error);
    }
  };

  if (!available) {
    return null;
  }

  return (
    <button
      className="apple-pay-button apple-pay-button-black"
      onClick={handleApplePayClick}
    />
  );
};
```

### Styling

```css
/* Apple Pay button styles */
.apple-pay-button {
  display: inline-block;
  -webkit-appearance: -apple-pay-button;
  -apple-pay-button-type: buy;
  cursor: pointer;
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 8px;
}

.apple-pay-button-black {
  -apple-pay-button-style: black;
}

.apple-pay-button-white {
  -apple-pay-button-style: white;
}

.apple-pay-button-white-outline {
  -apple-pay-button-style: white-outline;
}
```

---

## Testing

### Sandbox Environment

**Important Limitations**:
- Apple Pay domain registration may return 500 errors in sandbox
- Domain verification may not work correctly in sandbox
- For development, you may need to mock responses or use production environment

**Sandbox Credentials**:
- Use PayPal sandbox merchant account
- Test credit cards available in PayPal Developer Dashboard
- Apple Pay test cards in Wallet app (Sandbox mode)

### Production Checklist

Before going live:

- [ ] Merchant has completed PayPal business verification
- [ ] Apple Pay capability is ACTIVE in merchant account
- [ ] All production domains registered and VERIFIED
- [ ] SSL/TLS certificates valid and not expiring soon
- [ ] Apple Pay button displays correctly on all pages
- [ ] Payment flow tested end-to-end
- [ ] Refund flow tested
- [ ] Error handling tested (declined cards, network errors)
- [ ] Webhook endpoints configured and tested
- [ ] Monitoring and alerting configured
- [ ] Customer support trained on Apple Pay

---

## Troubleshooting

### Common Issues

#### 1. Domain Registration Returns 500 Error

**Error**:
```json
{
  "name": "INTERNAL_SERVER_ERROR",
  "message": "An internal server error has occurred.",
  "debug_id": "f290862543400"
}
```

**Possible Causes**:
- Sandbox environment limitation
- Merchant doesn't have APPLE_PAY capability active
- Domain not accessible via HTTPS
- Invalid PayPal-Auth-Assertion header

**Solutions**:
1. Verify merchant capabilities:
   ```typescript
   const status = await partnerApi.getMerchantStatus(merchantId);
   const hasApplePay = status.capabilities?.some(
     cap => cap.name === "APPLE_PAY" && cap.status === "ACTIVE"
   );
   ```

2. Check domain accessibility:
   ```bash
   curl -I https://your-domain.com
   # Should return 200 OK with valid SSL certificate
   ```

3. Verify PayPal-Auth-Assertion header is correctly formatted:
   ```typescript
   // Header format: base64(header).base64(payload).
   // Payload must include merchant_id in payer_id field
   const header = Buffer.from(JSON.stringify({ alg: "none" })).toString("base64");
   const payload = Buffer.from(JSON.stringify({
     iss: partnerClientId,
     payer_id: merchantId  // Must be PayPal Merchant ID, not email
   })).toString("base64");
   const assertion = `${header}.${payload}.`;
   ```

4. Contact PayPal Support with debug_id

5. Test in production environment if sandbox continues to fail

#### 2. Apple Pay Button Not Showing

**Possible Causes**:
- Not using Safari browser
- Domain not registered
- Not using HTTPS
- ApplePaySession not available

**Solutions**:
```typescript
// Check all requirements
const canShowApplePay = () => {
  // 1. Check browser support
  if (!window.ApplePaySession) {
    console.error("ApplePaySession not available");
    return false;
  }

  // 2. Check if can make payments
  if (!ApplePaySession.canMakePayments()) {
    console.error("Cannot make Apple Pay payments");
    return false;
  }

  // 3. Check HTTPS
  if (window.location.protocol !== 'https:') {
    console.error("Apple Pay requires HTTPS");
    return false;
  }

  // 4. Verify domain is registered
  // (Check with your backend)

  return true;
};
```

#### 3. Merchant Validation Failed

**Error**: `Invalid merchant session`

**Solutions**:
1. Ensure domain matches registered domain exactly
2. Check merchant identifier is correct
3. Verify SSL certificate is valid

#### 4. Payment Authorization Failed

**Error**: `Payment declined` or `Authorization failed`

**Solutions**:
1. Check payment amount matches Apple Pay session amount
2. Verify Apple Pay token is correctly formatted
3. Ensure all required fields are included in order request
4. Check PayPal-Auth-Assertion header is present
5. Verify merchant has sufficient processing limits

#### 5. Domain Status Stuck in PENDING

**Possible Causes**:
- Apple verification in progress (can take up to 24 hours)
- Domain not properly configured
- Domain verification file missing

**Solutions**:
1. Wait for Apple's verification (usually completes in minutes)
2. Verify domain is accessible publicly
3. Check domain configuration with PayPal support

---

## Documentation References

### Official PayPal Documentation

1. **Apple Pay Integration Guide**
   - URL: https://developer.paypal.com/docs/multiparty/checkout/apm/apple-pay/
   - Purpose: Main guide for Apple Pay integration with PayPal multiparty
   - Key Sections:
     - Prerequisites and merchant readiness
     - Domain registration process
     - Payment flow implementation
     - Testing guidelines

2. **Set Up Testing Environment**
   - URL: https://developer.paypal.com/docs/multiparty/checkout/apm/apple-pay/#set-up-your-testing-environment
   - Purpose: Guide for sandbox testing setup
   - Key Information:
     - Sandbox limitations documented
     - Test merchant setup
     - Test card information

3. **Wallet Domains API Reference**
   - URL: https://developer.paypal.com/api/rest/reference/wallet/v1/wallet-domains/
   - Purpose: Complete API reference for domain registration
   - Endpoints Documented:
     - POST /v1/customer/wallet-domains (Register domain)
     - GET /v1/customer/wallet-domains (Get domains)
     - POST /v1/customer/unregister-wallet-domain (Unregister domain)

4. **Orders API v2 Reference**
   - URL: https://developer.paypal.com/api/rest/reference/orders/v2/orders/
   - Purpose: Complete API reference for order creation and capture
   - Key Endpoints:
     - POST /v2/checkout/orders (Create order)
     - POST /v2/checkout/orders/{id}/capture (Capture payment)
     - GET /v2/checkout/orders/{id} (Get order details)

5. **Apple Pay Payment Source**
   - URL: https://developer.paypal.com/docs/checkout/apm/apple-pay/
   - Purpose: Documentation for Apple Pay payment source object
   - Key Information:
     - Payment source structure
     - Decrypted token format
     - Required fields

6. **Partner Referrals API**
   - URL: https://developer.paypal.com/api/rest/reference/customer-partner-referrals/
   - Purpose: Merchant onboarding API reference
   - Key Endpoints:
     - POST /v2/customer/partner-referrals (Create referral)
     - GET /v2/customer/partners/{partner-id}/merchant-integrations/{merchant-id} (Get status)

7. **PayPal-Auth-Assertion Header**
   - URL: https://developer.paypal.com/api/rest/requests/#paypal-auth-assertion
   - Purpose: Documentation for partner authentication header
   - Key Information:
     - Header format and structure
     - When to use merchant_id vs merchant_email
     - Examples and troubleshooting

### Web Shop Manager Integration Guide

8. **Web Shop Manager - Integration Guide (PDF)**
   - Location: `Web Shop Manager - Integration Guide.pdf`
   - Relevant Sections:
     - **Page 15-18**: Apple Pay domain registration requirements
     - **Page 22-25**: Payment processing with Apple Pay
     - **Page 30-32**: Merchant onboarding flow
     - **Page 45-47**: Partner fee collection setup
     - **Page 50-52**: Error handling and troubleshooting

### Apple Developer Documentation

9. **Apple Pay on the Web**
   - URL: https://developer.apple.com/documentation/apple_pay_on_the_web
   - Purpose: Apple's official Apple Pay web integration guide
   - Key Information:
     - ApplePaySession API reference
     - Payment request structure
     - Merchant validation process

10. **Apple Pay JS API**
    - URL: https://developer.apple.com/documentation/apple_pay_on_the_web/apple_pay_js_api
    - Purpose: Complete JavaScript API reference
    - Key Sections:
      - Session events and handlers
      - Payment authorization flow
      - Error handling

### Implementation Notes

**Endpoint Source Mapping**:

| Endpoint | Documentation Source | Page/Section |
|----------|---------------------|--------------|
| POST /v1/customer/wallet-domains | PayPal Wallet Domains API + WSM Guide | API Ref + Page 15 |
| GET /v1/customer/wallet-domains | PayPal Wallet Domains API | API Reference |
| POST /v1/customer/unregister-wallet-domain | PayPal Wallet Domains API | API Reference |
| POST /v2/checkout/orders | PayPal Orders v2 API + WSM Guide | API Ref + Page 22 |
| GET /v2/customer/partners/{}/merchant-integrations/{} | PayPal Partner Referrals API | API Reference |
| POST /v2/customer/partner-referrals | PayPal Multiparty Docs + WSM Guide | Multiparty + Page 30 |

**Key Implementation Details from Documentation**:

1. **Domain Registration** (from Wallet Domains API Reference):
   - Changed from `/v1/vault/apple-pay/domains` to `/v1/customer/wallet-domains`
   - Request format uses nested `domain` object with `name` field
   - Response includes `status` field (VERIFIED, PENDING, DENIED)

2. **PayPal-Auth-Assertion** (from PayPal REST API Requests docs):
   - Must use `merchant_id` (PayPal Merchant ID) in `payer_id` field
   - Not `merchant_email` (deprecated for this purpose)
   - Format: `base64(header).base64(payload).` (note trailing dot)

3. **Apple Pay Capability** (from Multiparty Apple Pay docs):
   - Merchant must have APPLE_PAY in capabilities array
   - Status must be ACTIVE
   - Check via merchant-integrations endpoint

4. **Sandbox Limitations** (from Testing Environment Setup docs):
   - Domain registration may not be fully supported in sandbox
   - 500 errors are common in sandbox for wallet-domains API
   - Recommend testing in production or using mock responses

---

## Summary

Apple Pay integration through PayPal requires:

1. ✅ **Merchant has Apple Pay capability enabled**
2. ✅ **Register HTTPS domains using wallet-domains API**
3. ✅ **Verify domains are in VERIFIED status**
4. ✅ **Implement Apple Pay button and session handling on frontend**
5. ✅ **Create PayPal orders with apple_pay payment source**
6. ✅ **Handle payment authorization and capture**
7. ✅ **Test thoroughly in production environment**

For support or questions, refer to the official PayPal documentation or contact PayPal Partner Support.
