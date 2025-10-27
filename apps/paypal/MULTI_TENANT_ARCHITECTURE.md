# Multi-Tenant Architecture for PayPal Merchant Onboarding

## Overview

This document clarifies the **tenant vs merchant** relationship in the PayPal app architecture and explains how the onboarding process works in a multi-tenant environment.

## Architecture Concepts

### 1. Tenant (Saleor Instance)
- **What it is**: A Saleor e-commerce instance (e.g., `mystore.saleor.cloud`)
- **Who manages it**: The platform owner (Web Shop Manager)
- **PayPal role**: Partner/Platform using PayPal Complete Payments (PPCP)
- **Configuration**: Has PayPal Partner API credentials (Client ID, Secret)

### 2. Merchant (Seller)
- **What it is**: An individual seller on the Saleor platform
- **Who manages it**: The merchant/seller user
- **PayPal role**: Seller/Merchant who accepts payments
- **Configuration**: Has their own PayPal Business account

## Two-Level Onboarding

```
┌─────────────────────────────────────────────────────────┐
│ LEVEL 1: TENANT SETUP (Platform Configuration)         │
│ Done once by platform admin                             │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────┐
        │ 1. Install PayPal App           │
        │ 2. Get Partner API Credentials  │
        │ 3. Configure in App Settings    │
        └─────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ LEVEL 2: MERCHANT ONBOARDING (Per-Seller)              │
│ Done for each merchant/seller on the platform          │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────┐
        │ 1. Merchant clicks "Connect"    │
        │ 2. Create Partner Referral      │
        │ 3. Redirect to PayPal ISU       │
        │ 4. Merchant completes signup    │
        │ 5. PayPal redirects back        │
        │ 6. Store merchant status        │
        └─────────────────────────────────┘
```

## Data Storage Model

### Tenant Data (Saleor Metadata)
Stored in: **Saleor App Metadata** via `PayPalMultiConfigMetadataManager`

```typescript
{
  "paypal-configs-v2": [
    {
      "id": "config_123",
      "name": "Main PayPal Account",
      "clientId": "partner_client_id",      // Partner/Platform credentials
      "clientSecret": "partner_secret",
      "environment": "LIVE"
    }
  ],
  "paypal-channel-mapping-v2": {
    "channel_1": "config_123"
  }
}
```

**Purpose**: Store platform's PayPal Partner API credentials

### Merchant Data (PostgreSQL)
Stored in: **`paypal_merchant_onboarding` table**

```sql
CREATE TABLE paypal_merchant_onboarding (
  saleor_api_url TEXT,           -- Which tenant/Saleor instance
  tracking_id TEXT,               -- Merchant's user ID in your system
  paypal_merchant_id TEXT,        -- PayPal's merchant ID after onboarding
  merchant_email TEXT,            -- Merchant's email
  onboarding_status TEXT,         -- PENDING, IN_PROGRESS, COMPLETED
  -- ... payment method flags
);
```

**Purpose**: Track each merchant's PayPal onboarding status

### APL Data (PostgreSQL)
Stored in: **`saleor_app_configuration` table**

```sql
CREATE TABLE saleor_app_configuration (
  tenant TEXT,                    -- Saleor API URL
  app_name TEXT,                  -- "PayPal"
  configurations JSONB,           -- AuthData (app token, etc.)
);
```

**Purpose**: Store Saleor authentication for each tenant

## Merchant Onboarding Flow (Detailed)

### Scenario: New Merchant Wants to Accept PayPal

#### Prerequisites
✅ Tenant (Saleor instance) has PayPal app installed
✅ Platform admin has configured Partner API credentials
✅ Merchant has a user account in the Saleor system

#### Step-by-Step Flow

**1. Merchant Initiates Onboarding**
```
Location: Merchant Dashboard → Payment Settings
Action: Merchant clicks "Connect PayPal" button
```

**2. Frontend Creates Referral**
```typescript
// In merchant dashboard (e.g., /pages/merchant/payment-settings.tsx)
const result = await trpc.merchantOnboarding.createMerchantReferral.mutate({
  trackingId: currentUser.id,              // Your user/merchant ID
  merchantEmail: currentUser.email,
  merchantCountry: "US",
  returnUrl: `${window.location.origin}/merchant/paypal/return`,
  businessName: currentUser.businessName,
});

// Redirect to PayPal
window.location.href = result.actionUrl;
```

**3. Backend Creates Partner Referral**
```typescript
// In create-merchant-referral-trpc-handler.ts

// Get platform's Partner API credentials from Saleor metadata
const paypalConfig = await metadataManager.getRootConfig();
const credentials = paypalConfig.paypalConfigsById[configId];

// Create Partner Referrals API client using PLATFORM credentials
const referralsApi = apiFactory.create({
  clientId: credentials.clientId,      // Platform's credentials
  clientSecret: credentials.clientSecret,
  env: credentials.environment,
});

// Build referral request for THIS merchant
const referralRequest = PartnerReferralBuilder.createDefault()
  .withTrackingId(input.trackingId)      // Merchant's ID
  .withEmail(input.merchantEmail)         // Merchant's email
  .withReturnUrl(input.returnUrl)
  .build();

// Call PayPal API to create signup link
const referralResponse = await referralsApi.createPartnerReferral(referralRequest);

// Store in database
await repository.create({
  saleorApiUrl: ctx.saleorApiUrl,        // Which tenant
  trackingId: input.trackingId,          // Which merchant
  partnerReferralId: referralResponse.partner_referral_id,
  actionUrl: referralResponse.actionUrl,
  merchantEmail: input.merchantEmail,
});

return { actionUrl: referralResponse.actionUrl };
```

**4. Merchant Completes PayPal ISU**
```
Location: PayPal's Integrated Sign-Up page
Actions:
  1. Login or create PayPal Business account
  2. Confirm business information
  3. Review and grant OAuth permissions to platform
  4. Click "Agree and Connect"
```

**5. PayPal Redirects Back**
```
URL: https://yourapp.com/merchant/paypal/return?merchantIdInPayPal=XXXXX&permissionsGranted=true
```

**6. Frontend Handles Return**
```typescript
// In /pages/merchant/paypal/return.tsx
import { useSearchParams } from 'next/navigation';

const searchParams = useSearchParams();
const merchantIdInPayPal = searchParams.get('merchantIdInPayPal');
const permissionsGranted = searchParams.get('permissionsGranted');

// Update database with PayPal merchant ID
await trpc.merchantOnboarding.updateMerchantId.mutate({
  trackingId: currentUser.id,
  paypalMerchantId: merchantIdInPayPal,
});

// Refresh status from PayPal
await trpc.merchantOnboarding.refreshMerchantStatus.mutate({
  trackingId: currentUser.id,
});

// Show success message and redirect
```

**7. Check Merchant Readiness**
```typescript
// Backend calls PayPal Show Seller Status API
const status = await referralsApi.getSellerStatus(merchantId);

// Check flags
const readiness = {
  primaryEmailConfirmed: status.PRIMARY_EMAIL_CONFIRMED,
  paymentsReceivable: status.PAYMENTS_RECEIVABLE,
  oauthIntegrated: status.oauth_integrations?.length > 0,
  // ... check products and capabilities
};

// Update database
await repository.updatePaymentMethodReadiness(saleorApiUrl, trackingId, readiness);
```

**8. Merchant Dashboard Shows Status**
```typescript
// Display current status
<MerchantStatusDashboard trackingId={currentUser.id} />

// Shows:
// ✅ Connected to PayPal
// ✅ Email confirmed
// ✅ Ready to receive payments
// ✅ Payment methods: PayPal, Cards, Apple Pay, Google Pay
```

## Where to Add UI Pages

### Option 1: Separate Merchant Pages (Recommended)

```
apps/paypal/src/pages/merchant/
├── payment-settings.tsx         # Main page - connect PayPal button
├── paypal-onboarding.tsx        # Onboarding form
├── paypal-return.tsx            # Return handler after PayPal
└── paypal-status.tsx            # Status dashboard
```

**Access**: `/merchant/payment-settings`

**When**: Merchant is logged in and wants to configure payments

### Option 2: Integrated into Existing Pages

If you already have a merchant dashboard:

```
apps/paypal/src/pages/config/
└── merchant-onboarding.tsx      # Add to existing config pages
```

### Option 3: Modal/Dialog (Quickest)

```typescript
// Add to existing dashboard page
import { MerchantOnboardingModal } from '@/modules/ui/merchant-onboarding-modal';

function MerchantDashboard() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  return (
    <>
      <button onClick={() => setShowOnboarding(true)}>
        Connect PayPal
      </button>

      <MerchantOnboardingModal
        open={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
    </>
  );
}
```

## Database Migration

### How to Run Migrations

**Option 1: Automatic on App Start (Current Implementation)**

The migration runs automatically when the app starts:

```typescript
// src/pages/api/[...rest].ts or app startup
import { initializeDatabase } from '@/lib/database';

// This runs on server startup
await initializeDatabase();
```

**Status**: ✅ Already implemented in `database.ts`

**Option 2: Manual Migration Script (Recommended for Production)**

Create a migration script:

```typescript
// scripts/migrate-database.ts
import { initializeDatabase } from '../src/lib/database';

async function main() {
  console.log('Running database migrations...');

  try {
    await initializeDatabase();
    console.log('✅ Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
```

Run with:
```bash
# Add to package.json scripts
pnpm run migrate
# or
ts-node scripts/migrate-database.ts
```

**Option 3: Using a Migration Tool**

For production, consider using a proper migration tool:

```bash
# Install migration tool
pnpm add -D node-pg-migrate

# Create migration
pnpm migrate create add-merchant-onboarding-table

# Run migrations
pnpm migrate up
```

### Migration Safety

The current implementation uses `CREATE TABLE IF NOT EXISTS`, which is safe to run multiple times:

```sql
CREATE TABLE IF NOT EXISTS paypal_merchant_onboarding (
  -- This won't error if table already exists
);

CREATE INDEX IF NOT EXISTS idx_merchant_onboarding_saleor_url
  ON paypal_merchant_onboarding(saleor_api_url);
  -- This won't error if index already exists
```

## Multi-Tenant Isolation

### How Merchants are Isolated by Tenant

Every query filters by `saleor_api_url`:

```typescript
// Get merchants for THIS tenant only
const merchants = await repository.list(ctx.saleorApiUrl);
// SELECT * FROM paypal_merchant_onboarding
// WHERE saleor_api_url = 'https://tenant1.saleor.cloud/graphql/'

// Different tenant sees different merchants
const merchants2 = await repository.list('https://tenant2.saleor.cloud/graphql/');
// Returns only tenant2's merchants
```

### Database Constraints

```sql
-- Ensures unique tracking ID per tenant
CONSTRAINT unique_tracking_id_per_instance
  UNIQUE (saleor_api_url, tracking_id)

-- Ensures unique PayPal merchant ID per tenant
CONSTRAINT unique_merchant_id_per_instance
  UNIQUE (saleor_api_url, paypal_merchant_id)
```

## Common Scenarios

### Scenario 1: Platform Admin Configures PayPal

**Who**: Platform administrator
**Where**: Admin dashboard → App Configuration
**What**: Configure Partner API credentials
**Page**: Existing `/config` pages (already implemented)
**Frequency**: Once per tenant

### Scenario 2: First Merchant Onboards

**Who**: Merchant user #1
**Where**: Merchant dashboard → Payment settings
**What**: Click "Connect PayPal" → Complete ISU → Return
**Page**: Need to create `/merchant/payment-settings`
**Frequency**: Once per merchant

### Scenario 3: Second Merchant Onboards

**Who**: Merchant user #2 (same tenant)
**Where**: Their own merchant dashboard
**What**: Same flow as Merchant #1
**Result**: Both merchants stored with same `saleor_api_url`, different `tracking_id`

### Scenario 4: Merchant Checks Status

**Who**: Any merchant
**Where**: Merchant dashboard
**What**: View payment method readiness, refresh status
**Page**: `/merchant/paypal-status`

### Scenario 5: Admin Views All Merchants

**Who**: Platform administrator
**Where**: Admin dashboard
**What**: See all merchants' onboarding status
**Page**: Admin section using `listMerchants` endpoint

## Payment Processing Flow

After merchant is onboarded:

```typescript
// When processing a payment for an order

// 1. Get the order's merchant/seller
const order = await getOrder(orderId);
const merchantId = order.sellerId;

// 2. Get merchant's PayPal status
const merchantStatus = await repository.getByTrackingId(
  saleorApiUrl,
  merchantId
);

// 3. Check if merchant can receive payments
if (!merchantStatus.paymentsReceivable) {
  throw new Error('Merchant cannot receive payments');
}

// 4. Use platform's credentials to create order on behalf of merchant
const paypalClient = PayPalClient.create({
  clientId: platformConfig.clientId,
  clientSecret: platformConfig.clientSecret,
  env: platformConfig.environment,
});

// 5. Include merchant ID in order metadata
const order = await paypalClient.createOrder({
  // ... order details
  merchant_id: merchantStatus.paypalMerchantId,  // PayPal routes payment to this merchant
});
```

## Summary: Who Does What

| Role | Action | When | Where |
|------|--------|------|-------|
| **Platform Admin** | Configure Partner API credentials | Once per tenant | Admin settings (existing) |
| **Platform Admin** | Run database migration | Once on deployment | Server startup or migration script |
| **Merchant** | Click "Connect PayPal" | Once per merchant | Merchant dashboard (need to create) |
| **Merchant** | Complete PayPal ISU | Once per merchant | PayPal.com (external) |
| **System** | Store merchant status | Automatic | Database |
| **System** | Refresh merchant status | Periodic/on-demand | Background job or manual trigger |
| **Merchant** | View payment status | As needed | Merchant dashboard |
| **Platform Admin** | View all merchants | As needed | Admin dashboard |

## Next Steps to Complete Implementation

1. **Create Merchant UI Pages** ⏳
   - `/pages/merchant/payment-settings.tsx` - Main page
   - `/pages/merchant/paypal-return.tsx` - Return handler
   - Component: `<MerchantOnboardingButton />`
   - Component: `<MerchantStatusDashboard />`

2. **Add Migration Script** ⏳
   - `scripts/migrate-database.ts`
   - Add to package.json: `"migrate": "ts-node scripts/migrate-database.ts"`

3. **Add Update Merchant ID Handler** ⏳
   - tRPC mutation to update `paypal_merchant_id` after return from PayPal

4. **Add Webhooks** ⏳
   - Handle onboarding events from PayPal

5. **Testing** ⏳
   - Test complete flow in sandbox
   - Test multi-merchant isolation

## FAQ

**Q: Can one merchant have multiple PayPal accounts?**
A: No. One merchant = one PayPal account. Tracked by unique `(saleor_api_url, tracking_id)`.

**Q: Can multiple Saleor instances use the same database?**
A: Yes. They're isolated by `saleor_api_url` in every query.

**Q: What if merchant already has a PayPal account?**
A: They login during ISU and grant permissions to the platform.

**Q: How do we handle marketplace splits?**
A: Use PayPal's partner fee features (to be implemented in payment processing).

**Q: When does the merchant get paid?**
A: Funds go directly to merchant's PayPal account after transaction capture.

---

**Status**: Architecture documented ✅
**Next**: Create merchant UI pages
**Last Updated**: 2025-10-27
