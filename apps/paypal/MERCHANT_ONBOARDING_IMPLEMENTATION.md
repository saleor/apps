# PayPal Merchant Onboarding Implementation

## Overview

This document describes the PayPal merchant onboarding implementation using the Partner Referrals V2 API with Integrated Sign-Up (ISU). The implementation allows Web Shop Manager to onboard sellers to accept PayPal payments on the platform.

## Architecture

### Components Implemented

1. **PayPal Partner Referrals API Client** (`src/modules/paypal/partner-referrals/`)
   - `paypal-partner-referrals-api.ts` - API client for Partner Referrals V2
   - `paypal-partner-referrals-api-factory.ts` - Factory for creating API instances
   - `types.ts` - Complete type definitions for API requests/responses
   - `partner-referral-builder.ts` - Builder pattern for creating referral requests

2. **Merchant Onboarding Repository** (`src/modules/merchant-onboarding/`)
   - `merchant-onboarding-repository.ts` - PostgreSQL repository for tracking onboarding
   - Database table: `paypal_merchant_onboarding`

3. **tRPC Handlers** (`src/modules/merchant-onboarding/trpc-handlers/`)
   - `create-merchant-referral-trpc-handler.ts` - Create onboarding link
   - `get-merchant-status-trpc-handler.ts` - Get merchant status
   - `refresh-merchant-status-trpc-handler.ts` - Refresh from PayPal
   - `list-merchants-trpc-handler.ts` - List all merchants
   - `merchant-onboarding-router.ts` - tRPC router

4. **Database Schema**
   - Updated `src/lib/database.ts` with merchant onboarding table
   - `src/lib/database-schema.sql` - Complete SQL schema documentation

5. **Branded Types**
   - `paypal-merchant-id.ts` - PayPal merchant ID type
   - `paypal-partner-referral-id.ts` - Partner referral ID type

## Features

### 1. Create Partner Referral

Creates a PayPal partner referral and returns an onboarding signup link.

**tRPC Endpoint:** `merchantOnboarding.createMerchantReferral`

**Input:**
```typescript
{
  trackingId: string;           // Unique ID for merchant in your system
  merchantEmail: string;         // Merchant email (required)
  merchantCountry?: string;      // ISO 3166-1 alpha-2 (e.g., "US")
  preferredLanguage?: string;    // e.g., "en-US"
  returnUrl: string;             // Where to redirect after onboarding
  returnUrlDescription?: string;
  logoUrl?: string;              // Partner logo for branding

  // Optional prefill
  businessName?: string;
  businessType?: "INDIVIDUAL" | "PROPRIETORSHIP" | ...;
  businessWebsite?: string;

  // Payment methods (defaults all true)
  enablePPCP?: boolean;
  enableApplePay?: boolean;
  enableGooglePay?: boolean;
  enableVaulting?: boolean;
}
```

**Output:**
```typescript
{
  success: boolean;
  actionUrl: string;              // PayPal signup URL
  partnerReferralId: string;
  trackingId: string;
}
```

**Implementation Details:**
- Uses `PartnerReferralBuilder.createDefault()` which includes:
  - PPCP (PayPal Complete Payments)
  - Payment Methods (Apple Pay, Google Pay)
  - Advanced Vaulting
- Stores onboarding record in database
- Returns action URL for merchant to complete signup

### 2. Get Merchant Status

Retrieves the current onboarding status for a merchant from the database.

**tRPC Endpoint:** `merchantOnboarding.getMerchantStatus`

**Input:**
```typescript
{
  trackingId: string;
}
```

**Output:**
```typescript
{
  trackingId: string;
  merchantEmail: string;
  onboardingStatus: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  actionUrl: string;
  primaryEmailConfirmed: boolean;
  paymentsReceivable: boolean;
  oauthIntegrated: boolean;
  paymentMethods: {
    paypalButtons: boolean;
    advancedCardProcessing: boolean;
    applePay: boolean;
    googlePay: boolean;
    vaulting: boolean;
  };
  lastStatusCheck: Date;
  statusCheckError?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 3. Refresh Merchant Status

Calls PayPal's Show Seller Status API to get the latest merchant status and updates the database.

**tRPC Endpoint:** `merchantOnboarding.refreshMerchantStatus`

**Input:**
```typescript
{
  trackingId: string;
}
```

**Output:**
```typescript
{
  success: boolean;
  readiness: PaymentMethodReadiness;
  onboardingStatus: OnboardingStatus;
}
```

**Checks Performed:**
- PRIMARY_EMAIL_CONFIRMED flag
- PAYMENTS_RECEIVABLE flag
- OAUTH_INTEGRATIONS array
- PPCP_CUSTOM product subscription
- CUSTOM_CARD_PROCESSING capability (ACDC)
- APPLE_PAY capability
- GOOGLE_PAY capability
- ADVANCED_VAULTING capability

**Status Logic:**
```typescript
if (primaryEmailConfirmed && paymentsReceivable && oauthIntegrated) {
  status = "COMPLETED";
} else {
  status = "IN_PROGRESS";
}
```

### 4. List Merchants

Lists all merchant onboardings for the current Saleor instance.

**tRPC Endpoint:** `merchantOnboarding.listMerchants`

**Output:**
```typescript
{
  merchants: Array<{
    trackingId: string;
    merchantEmail: string;
    merchantCountry: string;
    onboardingStatus: OnboardingStatus;
    primaryEmailConfirmed: boolean;
    paymentsReceivable: boolean;
    oauthIntegrated: boolean;
    paymentMethods: {...};
    lastStatusCheck: Date;
    createdAt: Date;
    updatedAt: Date;
  }>;
}
```

## Payment Method Readiness Checks

### PayPal Buttons
✅ Available if `PPCP_CUSTOM` product has `vetting_status: "SUBSCRIBED"`

### Advanced Card Processing (ACDC)
✅ Available if:
- `PPCP_CUSTOM` product has `vetting_status: "SUBSCRIBED"`
- `CUSTOM_CARD_PROCESSING` capability has `status: "ACTIVE"`
- No `limits` property in capability

### Apple Pay
✅ Available if:
- `PPCP_CUSTOM` product has `vetting_status: "SUBSCRIBED"`
- `PAYMENT_METHODS` product has `vetting_status: "SUBSCRIBED"`
- `APPLE_PAY` capability has `status: "ACTIVE"`

### Google Pay
✅ Available if:
- `PPCP_CUSTOM` product has `vetting_status: "SUBSCRIBED"`
- `PAYMENT_METHODS` product has `vetting_status: "SUBSCRIBED"`
- `GOOGLE_PAY` capability has `status: "ACTIVE"`

### Vaulting
✅ Available if:
- `ADVANCED_VAULTING` product has `vetting_status: "SUBSCRIBED"`
- `PAYPAL_WALLET_VAULTING_ADVANCED` capability has `status: "ACTIVE"`
- Required OAuth scopes present:
  - `https://uri.paypal.com/services/billing-agreements`
  - `https://uri.paypal.com/services/vault/payment-tokens/read`
  - `https://uri.paypal.com/services/vault/payment-tokens/readwrite`

## Database Schema

```sql
CREATE TABLE paypal_merchant_onboarding (
  id UUID PRIMARY KEY,
  saleor_api_url TEXT NOT NULL,
  tracking_id TEXT NOT NULL,
  paypal_merchant_id TEXT,
  partner_referral_id TEXT,
  merchant_email TEXT,
  merchant_country TEXT,
  onboarding_status TEXT DEFAULT 'PENDING',
  onboarding_started_at TIMESTAMP,
  onboarding_completed_at TIMESTAMP,
  action_url TEXT,
  return_url TEXT,

  -- Status flags
  primary_email_confirmed BOOLEAN DEFAULT FALSE,
  payments_receivable BOOLEAN DEFAULT FALSE,
  oauth_integrated BOOLEAN DEFAULT FALSE,

  -- Payment methods
  paypal_buttons_enabled BOOLEAN DEFAULT FALSE,
  acdc_enabled BOOLEAN DEFAULT FALSE,
  apple_pay_enabled BOOLEAN DEFAULT FALSE,
  google_pay_enabled BOOLEAN DEFAULT FALSE,
  vaulting_enabled BOOLEAN DEFAULT FALSE,

  subscribed_products JSONB DEFAULT '[]',
  active_capabilities JSONB DEFAULT '[]',
  last_status_check TIMESTAMP,
  status_check_error TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE (saleor_api_url, tracking_id),
  UNIQUE (saleor_api_url, paypal_merchant_id)
);
```

## Usage Flow

### 1. Admin Creates Onboarding Link

```typescript
const result = await trpc.merchantOnboarding.createMerchantReferral.mutate({
  trackingId: "user_123",
  merchantEmail: "merchant@example.com",
  merchantCountry: "US",
  returnUrl: "https://yourapp.com/paypal/return",
  businessName: "My Shop",
});

// Redirect merchant to: result.actionUrl
```

### 2. Merchant Completes Onboarding

Merchant is redirected to PayPal's ISU flow:
1. Login or create PayPal account
2. Confirm business information
3. Grant OAuth permissions to platform
4. Redirected back to `returnUrl`

### 3. Check Merchant Status

```typescript
// Get current status from database
const status = await trpc.merchantOnboarding.getMerchantStatus.query({
  trackingId: "user_123",
});

// Refresh from PayPal (requires merchant completed onboarding)
const refreshed = await trpc.merchantOnboarding.refreshMerchantStatus.mutate({
  trackingId: "user_123",
});
```

### 4. Display Status to Merchant

```typescript
if (!status.primaryEmailConfirmed) {
  // Show: "Please confirm your email with PayPal"
}

if (!status.paymentsReceivable) {
  // Show: "Your PayPal account has restrictions. Contact PayPal support."
}

if (!status.oauthIntegrated) {
  // Show: "Please complete onboarding and grant permissions"
}

// Show enabled payment methods
if (status.paymentMethods.paypalButtons) {
  // Enable PayPal button
}

if (status.paymentMethods.advancedCardProcessing) {
  // Enable card fields
}
```

## Best Practices (from Integration Guide)

✅ **Show seller's PayPal email** - Display the connected email
✅ **Share seller data** - Prefill onboarding with known information
✅ **Unique tracking_id** - Use unique ID per merchant (e.g., user ID)
✅ **Don't share action URLs** - Each URL is for one merchant only
✅ **Periodic status checks** - Refresh seller status regularly
✅ **Subscribe to webhooks** - Handle consent revocation events
✅ **PayPal as first option** - Present PayPal as preferred payment method
✅ **Enable based on status** - Only enable approved payment methods

## Integration with Existing Payment Flow

Once a merchant has `onboardingStatus: "COMPLETED"`:

1. **Use their merchant ID** for payment processing
2. **Enable payment methods** based on readiness flags
3. **Store in channel mapping** - Associate merchant with Saleor channels
4. **Pass in transactions** - Use merchant credentials for orders

## Environment Variables

```env
# Required for Partner API
# (Uses existing PayPal credentials from app-config)

# Database (already configured)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=paypal_app
DB_USER=postgres
DB_PASSWORD=secret

# BN Code (to be provided by PayPal)
PAYPAL_BN_CODE=your_bn_code_here
```

## Next Steps

### Required:
1. ✅ Implement webhook handlers for:
   - `CUSTOMER.MERCHANT-INTEGRATION.PRODUCT-SUBSCRIPTION-UPDATED`
   - `MERCHANT.PARTNER-CONSENT.REVOKED`

2. ✅ Create UI components:
   - Onboarding initiation form
   - Merchant status dashboard
   - Account unlinking button

3. ✅ Add tests:
   - Unit tests for API client
   - Integration tests for repository
   - E2E tests for onboarding flow

### Optional Enhancements:
- Auto-refresh status after return from PayPal
- Email notifications for status changes
- Admin dashboard for monitoring all merchants
- Webhook retry mechanism
- Multiple PayPal account support per merchant

## File Structure

```
src/modules/
├── paypal/
│   ├── partner-referrals/
│   │   ├── types.ts
│   │   ├── paypal-partner-referrals-api.ts
│   │   ├── paypal-partner-referrals-api-factory.ts
│   │   ├── partner-referral-builder.ts
│   │   └── index.ts
│   ├── paypal-merchant-id.ts
│   └── paypal-partner-referral-id.ts
│
├── merchant-onboarding/
│   ├── merchant-onboarding-repository.ts
│   └── trpc-handlers/
│       ├── create-merchant-referral-input-schema.ts
│       ├── create-merchant-referral-trpc-handler.ts
│       ├── get-merchant-status-trpc-handler.ts
│       ├── refresh-merchant-status-trpc-handler.ts
│       ├── list-merchants-trpc-handler.ts
│       └── merchant-onboarding-router.ts
│
└── lib/
    ├── database.ts (updated)
    └── database-schema.sql

```

## API Reference

### Partner Referrals V2 API

**Create Partner Referral:**
```
POST /v2/customer/partner-referrals
```

**Show Seller Status:**
```
GET /v1/customer/partners/merchant-integrations/{merchant_id}
```

### Documentation Links

- [Partner Referrals V2 API](https://developer.paypal.com/api/partner-referrals/v2/)
- [Integrated Sign-Up (ISU)](https://developer.paypal.com/docs/marketplaces/onboard/)
- [Seller Onboarding Guide](https://developer.paypal.com/docs/marketplaces/onboard/sellers/)

## Support

For questions or issues:
1. Check PayPal Developer Documentation
2. Review implementation code and comments
3. Contact your PayPal integration engineer
4. Refer to the integration guide PDF provided

---

**Implementation Status:** Core functionality complete ✅
**Next Phase:** UI components and webhook handlers
**Last Updated:** 2025-10-27
