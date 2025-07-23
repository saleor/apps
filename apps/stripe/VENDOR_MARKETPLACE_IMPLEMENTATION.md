# Vendor Marketplace Implementation Guide

This guide outlines how to implement dynamic merchant of record functionality for the Stripe app in a marketplace environment using Saleor page objects for vendors.

## Overview

The implementation allows the Stripe app to:
1. Extract vendor ID from order metadata
2. Fetch vendor details from Saleor page objects
3. Use vendor-specific Stripe account IDs for payments
4. Fall back to channel-based configuration when no vendor-specific config exists

## Implementation Steps

### 1. Order Creation with Vendor ID

When creating orders, add the vendor ID to the order metadata:

```graphql
# When completing checkout or creating order
mutation CheckoutComplete($checkoutId: ID!, $vendorId: ID!) {
  checkoutComplete(
    id: $checkoutId
    input: {
      # ... other checkout data
    }
  ) {
    order {
      id
      metadata {
        key
        value
      }
    }
    errors {
      field
      message
    }
  }
}

# Then update the order with vendor ID metadata
mutation UpdateOrderMetadata($orderId: ID!, $vendorId: ID!) {
  updateMetadata(
    id: $orderId
    input: [
      { key: "vendor_id", value: $vendorId }
    ]
  ) {
    item {
      ... on Order {
        id
        metadata {
          key
          value
        }
      }
    }
    errors {
      field
      message
    }
  }
}
```

### 2. Vendor Page Structure

Create a "Vendor" page type in Saleor with the following metadata structure:

```json
{
  "stripe_account_id": "acct_123456789",
  "vendor_code": "VENDOR001",
  "contact_email": "payments@vendor.com"
}
```

### 3. GraphQL Queries

The following queries have been added to fetch vendor data:

#### `apps/stripe/graphql/queries/fetch-vendors.graphql`
```graphql
query FetchVendors($pageTypeId: ID!) {
  pages(
    filter: { pageTypes: [$pageTypeId] }
    first: 100
  ) {
    edges {
      node {
        id
        title
        slug
        metadata {
          key
          value
        }
        pageType {
          id
          name
        }
      }
    }
  }
}
```

#### `apps/stripe/graphql/queries/fetch-vendor-by-id.graphql`
```graphql
query FetchVendorById($vendorId: ID!) {
  page(id: $vendorId) {
    id
    title
    slug
    metadata {
      key
      value
    }
    pageType {
      id
      name
    }
  }
}
```

### 4. Updated Source Object Fragment

The source object fragment has been updated to include order metadata:

```graphql
fragment SourceObject on OrderOrCheckout {
  ... on Checkout {
    __typename
    id
    channel {
      ...Channel
    }
  }
  ... on Order {
    __typename
    id
    channel {
      ...Channel
    }
    metadata {
      key
      value
    }
  }
}
```

### 5. Vendor Services

#### VendorFetcher (`apps/stripe/src/modules/saleor/vendor-fetcher.ts`)

Handles fetching vendor data from Saleor:

```typescript
export interface Vendor {
  id: string;
  title: string;
  slug: string;
  stripeAccountId?: string;
  metadata: Array<{ key: string; value: string }>;
}

export class VendorFetcher {
  async fetchVendorById(vendorId: string): Promise<Result<Vendor | null, Error>>
  async fetchVendors(pageTypeId: string): Promise<Result<Vendor[], Error>>
}
```

#### VendorResolver (`apps/stripe/src/modules/saleor/vendor-resolver.ts`)

Handles vendor resolution logic:

```typescript
export interface VendorResolutionResult {
  vendor: Vendor;
  stripeAccountId: string;
  resolutionMethod: "vendor-specific" | "channel-based" | "default";
}

export class VendorResolver {
  async resolveVendorForPayment(args: {
    orderMetadata: Array<{ key: string; value: string }>;
    channelId: string;
    defaultStripeConfigId?: string;
  }): Promise<Result<VendorResolutionResult | null, Error>>
}
```

### 6. Payment Processing Integration

To integrate vendor resolution into the payment processing, modify the `TransactionInitializeSessionUseCase`:

#### Key Changes in `apps/stripe/src/app/api/webhooks/saleor/transaction-initialize-session/use-case.ts`:

1. **Add VendorResolver dependency**:
```typescript
constructor(deps: {
  appConfigRepo: AppConfigRepo;
  stripePaymentIntentsApiFactory: IStripePaymentIntentsApiFactory;
  transactionRecorder: TransactionRecorderRepo;
  vendorResolver: VendorResolver; // Add this
}) {
  // ... existing code
  this.vendorResolver = deps.vendorResolver;
}
```

2. **Add vendor resolution logic** (around line 190):
```typescript
// Extract order metadata for vendor resolution
const orderMetadata = event.sourceObject.__typename === "Order" ? event.sourceObject.metadata : [];

// Try vendor-specific resolution first
const vendorResolutionResult = await this.vendorResolver.resolveVendorForPayment({
  orderMetadata,
  channelId: event.sourceObject.channel.id,
});

let stripeConfig;
let resolutionMethod: string;

if (vendorResolutionResult.isOk() && vendorResolutionResult.value) {
  // Use vendor-specific Stripe account
  const vendorResult = vendorResolutionResult.value;
  stripeConfig = {
    id: vendorResult.stripeAccountId,
    restrictedKey: vendorResult.stripeAccountId, // This would need to be resolved from the vendor's Stripe config
    publishableKey: "", // This would need to be resolved
    webhookSecret: "", // This would need to be resolved
    webhookId: "", // This would need to be resolved
    name: vendorResult.vendor.title,
    getStripeEnvValue: () => "live", // This would need to be determined
  };
  resolutionMethod = vendorResult.resolutionMethod;

  this.logger.info("Using vendor-specific Stripe configuration", {
    vendorId: vendorResult.vendor.id,
    vendorName: vendorResult.vendor.title,
    stripeAccountId: vendorResult.stripeAccountId,
    resolutionMethod,
  });
} else {
  // Fall back to channel-based configuration (existing logic)
  const stripeConfigForThisChannel = await this.appConfigRepo.getStripeConfig({
    channelId: event.sourceObject.channel.id,
    appId,
    saleorApiUrl,
  });
  // ... existing fallback logic
  stripeConfig = stripeConfigForThisChannel.value;
  resolutionMethod = "channel-based";
}
```

### 7. Configuration Management

#### Vendor Stripe Account Storage

You have two options for storing vendor Stripe account information:

**Option A: Direct Stripe Account IDs in Vendor Metadata**
- Store the Stripe account ID directly in vendor page metadata
- Simple but requires manual Stripe account management

**Option B: Vendor-to-Stripe-Config Mapping**
- Create a separate mapping table in the app configuration
- More flexible but requires additional configuration management

#### Recommended Approach

For simplicity, use **Option A** with the following vendor metadata structure:

```json
{
  "stripe_account_id": "acct_123456789",
  "stripe_publishable_key": "pk_test_...",
  "stripe_restricted_key": "sk_test_...",
  "stripe_webhook_secret": "whsec_...",
  "stripe_environment": "test"
}
```

### 8. Setup Instructions

#### Step 1: Create Vendor Page Type
1. In Saleor admin, create a new page type called "Vendor"
2. Add metadata fields for Stripe configuration

#### Step 2: Create Vendor Pages
1. Create vendor pages with the appropriate metadata
2. Ensure each vendor has a valid Stripe account ID

#### Step 3: Update Order Creation
1. Modify your order creation process to include vendor_id in metadata
2. Ensure the vendor_id corresponds to a valid vendor page ID

#### Step 4: Regenerate GraphQL Types
```bash
cd apps/stripe
npm run codegen
```

#### Step 5: Update Dependencies
1. Add VendorResolver to the dependency injection
2. Update the webhook handler to use the new vendor resolution logic

### 9. Testing

#### Unit Tests

Comprehensive unit tests have been created for the vendor functionality:

- **`apps/stripe/src/modules/saleor/__tests__/vendor-fetcher.test.ts`** - Tests for VendorFetcher class
- **`apps/stripe/src/modules/saleor/__tests__/vendor-resolver-simple.test.ts`** - Tests for VendorResolver logic  
- **`apps/stripe/src/modules/saleor/__tests__/vendor-integration.test.ts`** - Integration tests for vendor functionality
- **`apps/stripe/src/app/api/webhooks/saleor/transaction-initialize-session/__tests__/vendor-integration.test.ts`** - Payment processing integration tests

#### Test Scenarios

1. **Vendor-specific payment**: Order with vendor_id metadata → uses vendor's Stripe account
2. **Fallback to channel**: Order without vendor_id → uses channel's Stripe config
3. **Invalid vendor**: Order with invalid vendor_id → falls back to channel config
4. **Missing Stripe config**: Vendor without stripe_account_id → falls back to channel config

#### Running Tests

```bash
cd apps/stripe
npm test
```

#### Test Data Setup

```graphql
# Create test vendor
mutation CreateVendorPage {
  pageCreate(
    input: {
      title: "Test Vendor"
      slug: "test-vendor"
      pageType: "VENDOR_PAGE_TYPE_ID"
      metadata: [
        { key: "stripe_account_id", value: "acct_test123" }
        { key: "stripe_restricted_key", value: "sk_test_..." }
      ]
    }
  ) {
    page {
      id
      title
      metadata {
        key
        value
      }
    }
    errors {
      field
      message
    }
  }
}

# Create test order with vendor
mutation CreateOrderWithVendor($vendorId: ID!) {
  orderCreate(
    input: {
      # ... order data
    }
  ) {
    order {
      id
      metadata {
        key
        value
      }
    }
  }
}

# Update order with vendor metadata
mutation UpdateOrderVendor($orderId: ID!, $vendorId: ID!) {
  updateMetadata(
    id: $orderId
    input: [
      { key: "vendor_id", value: $vendorId }
    ]
  ) {
    item {
      ... on Order {
        id
        metadata {
          key
          value
        }
      }
    }
  }
}
```

### 10. Security Considerations

1. **Stripe Key Management**: Ensure vendor Stripe keys are stored securely
2. **Access Control**: Implement proper access controls for vendor data
3. **Validation**: Validate vendor IDs and Stripe account IDs
4. **Audit Logging**: Log all vendor resolution decisions for audit purposes

### 11. Monitoring and Observability

Add logging for vendor resolution:

```typescript
this.logger.info("Vendor resolution result", {
  vendorId: vendorResult?.vendor.id,
  vendorName: vendorResult?.vendor.title,
  stripeAccountId: vendorResult?.stripeAccountId,
  resolutionMethod: vendorResult?.resolutionMethod,
  orderId: event.sourceObject.id,
});
```

### 12. Future Enhancements

1. **Vendor Dashboard**: Add UI for vendors to manage their Stripe configuration
2. **Multi-currency Support**: Support different currencies per vendor
3. **Vendor Analytics**: Track payment performance per vendor
4. **Automated Onboarding**: Streamline vendor Stripe account setup

## Summary

This implementation provides a robust foundation for marketplace payments while maintaining backward compatibility with the existing channel-based configuration system. The vendor resolution logic ensures that payments are processed through the appropriate Stripe account while providing clear fallback mechanisms. 