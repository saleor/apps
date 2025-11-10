# Google Pay Implementation Guide

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Google Pay Endpoints](#google-pay-endpoints)
4. [Step-by-Step Implementation](#step-by-step-implementation)
5. [Frontend Integration](#frontend-integration)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)
8. [Documentation References](#documentation-references)

---

## Overview

Google Pay integration through PayPal's Complete Payments  platform enables merchants to accept Google Pay payments on web and Android applications. This guide provides comprehensive implementation instructions including merchant setup, payment processing, and best practices.

### Key Features
- Seamless Google Pay checkout experience
- Support for web and Android platforms
- Secure tokenized payments
- Multi-currency support
- Partner fee collection capability
- One-tap checkout with saved payment methods

---

## Prerequisites

### 1. Merchant Requirements

Before implementing Google Pay, ensure the merchant has:

1. **Active PayPal Business Account**
   - Account must be in good standing
   - Business verification completed
   - Primary email confirmed

2. **Google Pay Capability Enabled**
   - Contact PayPal support to enable GOOGLE_PAY capability
   - Verify capability using the merchant-integrations endpoint
   - Check for `GOOGLE_PAY` in the `capabilities` array

3. **Required Products Active**
   ```json
   {
     "products": [
       {
         "name": "PPCP_CUSTOM",
         "vetting_status": "SUBSCRIBED"
       },
       {
         "name": "GOOGLE_PAY",
         "vetting_status": "SUBSCRIBED"
       }
     ]
   }
   ```

4. **Google Pay Business Profile** (for Android apps)
   - Register with Google Pay Business Console
   - Complete merchant verification
   - Configure branding and policies

### 2. Technical Requirements

- PayPal Partner Account with Partner Merchant ID
- Client ID and Client Secret (Partner credentials)
- Merchant's PayPal Merchant ID (obtained after onboarding)
- HTTPS domain for web implementation
- Google Play Services (for Android apps)
- Google Pay API Library integrated

---

## Google Pay Endpoints

### 1. Get Merchant Capabilities

**Purpose**: Check if merchant has Google Pay enabled and retrieve merchant configuration details.

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
      "name": "PPCP_CUSTOM",
      "vetting_status": "SUBSCRIBED",
      "capabilities": [
        "GOOGLE_PAY",
        "APPLE_PAY",
        "CUSTOM_CARD_PROCESSING",
        "PAYPAL_WALLET"
      ]
    }
  ],
  "capabilities": [
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
- Before showing Google Pay button on frontend
- To verify merchant readiness for Google Pay payments
- Periodic health checks

**Code Example**:
```typescript
// Check if merchant has Google Pay enabled
const statusResult = await partnerApi.getMerchantStatus(merchantId);

if (statusResult.isErr()) {
  throw new Error("Failed to get merchant status");
}

const status = statusResult.value;

// Check for Google Pay capability
const hasGooglePay = status.capabilities?.some(
  cap => cap.name === "GOOGLE_PAY" && cap.status === "ACTIVE"
);

// Store in database
await repository.update(trackingId, {
  googlePayEnabled: hasGooglePay,
  capabilities: status.capabilities,
});
```

---

### 2. Create Order with Google Pay

**Purpose**: Create a PayPal order using Google Pay as the payment source.

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
          },
          "category": "PHYSICAL_GOODS"
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
    "google_pay": {
      "name": "John Doe",
      "email_address": "john.doe@example.com",
      "phone_number": {
        "country_code": "1",
        "national_number": "4085551234"
      },
      "decrypted_token": {
        "message_id": "GOOGLE_PAY_MESSAGE_ID",
        "message_expiration": "1640995200000",
        "signature": "GOOGLE_PAY_SIGNATURE",
        "signed_message": "GOOGLE_PAY_SIGNED_MESSAGE",
        "protocol_version": "ECv2",
        "signed_key": "GOOGLE_PAY_SIGNED_KEY"
      },
      "attributes": {
        "verification": {
          "method": "SCA_ALWAYS"
        }
      }
    }
  },
  "application_context": {
    "brand_name": "Your Store Name",
    "locale": "en-US",
    "landing_page": "NO_PREFERENCE",
    "shipping_preference": "SET_PROVIDED_ADDRESS",
    "user_action": "PAY_NOW",
    "return_url": "https://example.com/checkout/return",
    "cancel_url": "https://example.com/checkout/cancel"
  }
}
```

**Response Format**:
```json
{
  "id": "5O190127TN364715T",
  "status": "COMPLETED",
  "payment_source": {
    "google_pay": {
      "name": "John Doe",
      "email_address": "john.doe@example.com",
      "phone_number": {
        "country_code": "1",
        "national_number": "4085551234"
      },
      "card": {
        "name": "John Doe",
        "type": "CREDIT",
        "brand": "VISA",
        "last_digits": "1234",
        "billing_address": {
          "address_line_1": "123 Main St",
          "admin_area_2": "San Jose",
          "admin_area_1": "CA",
          "postal_code": "95131",
          "country_code": "US"
        }
      }
    }
  },
  "purchase_units": [
    {
      "reference_id": "ORDER-123",
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
      },
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
              "status": "ELIGIBLE",
              "dispute_categories": [
                "ITEM_NOT_RECEIVED",
                "UNAUTHORIZED_TRANSACTION"
              ]
            },
            "create_time": "2024-01-15T10:30:00Z",
            "update_time": "2024-01-15T10:30:05Z"
          }
        ]
      }
    }
  ],
  "links": [
    {
      "href": "https://api.paypal.com/v2/checkout/orders/5O190127TN364715T",
      "rel": "self",
      "method": "GET"
    }
  ],
  "create_time": "2024-01-15T10:30:00Z",
  "update_time": "2024-01-15T10:30:05Z"
}
```

**Implementation Location**:
- `src/app/api/webhooks/saleor/payment-gateway-initialize-session/use-case.ts`
- Frontend: Storefront checkout component

**When to Use**:
- When customer completes Google Pay authorization
- After receiving payment token from Google Pay API
- During checkout flow when Google Pay is selected

**Code Example**:
```typescript
// Create order with Google Pay payment source
const orderResult = await paypalClient.makeRequest({
  method: "POST",
  path: "/v2/checkout/orders",
  body: {
    intent: "CAPTURE",
    purchase_units: [{
      reference_id: saleorOrderId,
      amount: {
        currency_code: currency,
        value: totalAmount,
        breakdown: {
          item_total: { currency_code: currency, value: itemTotal },
          shipping: { currency_code: currency, value: shippingCost },
          tax_total: { currency_code: currency, value: taxAmount }
        }
      },
      items: orderItems,
      shipping: shippingAddress
    }],
    payment_source: {
      google_pay: {
        name: googlePayData.paymentMethodData.info.billingAddress.name,
        email_address: googlePayData.email,
        phone_number: {
          country_code: "1",
          national_number: phoneNumber
        },
        decrypted_token: {
          message_id: googlePayToken.messageId,
          message_expiration: googlePayToken.messageExpiration,
          signature: googlePayToken.signature,
          signed_message: googlePayToken.signedMessage,
          protocol_version: googlePayToken.protocolVersion,
          signed_key: googlePayToken.signedKey
        }
      }
    },
    application_context: {
      brand_name: storeName,
      locale: locale,
      user_action: "PAY_NOW"
    }
  }
});
```

---

### 3. Capture Order

**Purpose**: Capture payment for an authorized Google Pay order.

**Endpoint**: `POST /v2/checkout/orders/{order_id}/capture`

**Authentication**:
- Bearer token (OAuth 2.0)
- PayPal-Auth-Assertion header (required for partner context)

**Request**: Empty body or optional capture details

**Response Format**:
```json
{
  "id": "5O190127TN364715T",
  "status": "COMPLETED",
  "payment_source": {
    "google_pay": {
      "name": "John Doe",
      "email_address": "john.doe@example.com",
      "card": {
        "last_digits": "1234",
        "type": "CREDIT",
        "brand": "VISA"
      }
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

**When to Use**:
- After order is created with intent "AUTHORIZE"
- When fulfillment is confirmed
- Within 3 days of authorization (29 days for some card types)

---

### 4. Refund Payment

**Purpose**: Refund a captured Google Pay payment partially or fully.

**Endpoint**: `POST /v2/payments/captures/{capture_id}/refund`

**Authentication**:
- Bearer token (OAuth 2.0)
- PayPal-Auth-Assertion header (required for partner context)

**Request Format**:
```json
{
  "amount": {
    "currency_code": "USD",
    "value": "50.00"
  },
  "invoice_id": "REFUND-123",
  "note_to_payer": "Refund for returned item"
}
```

**Response Format**:
```json
{
  "id": "1JU08902781691411",
  "status": "COMPLETED",
  "amount": {
    "currency_code": "USD",
    "value": "50.00"
  },
  "invoice_id": "REFUND-123",
  "note_to_payer": "Refund for returned item",
  "seller_payable_breakdown": {
    "gross_amount": {
      "currency_code": "USD",
      "value": "50.00"
    },
    "paypal_fee": {
      "currency_code": "USD",
      "value": "0.00"
    },
    "net_amount": {
      "currency_code": "USD",
      "value": "50.00"
    },
    "total_refunded_amount": {
      "currency_code": "USD",
      "value": "50.00"
    }
  },
  "create_time": "2024-01-16T15:00:00Z",
  "update_time": "2024-01-16T15:00:02Z",
  "links": [
    {
      "href": "https://api.paypal.com/v2/payments/refunds/1JU08902781691411",
      "rel": "self",
      "method": "GET"
    }
  ]
}
```

**When to Use**:
- Customer returns product
- Order cancellation after capture
- Partial refunds for order adjustments

---

### 5. Get Order Details

**Purpose**: Retrieve complete details of a Google Pay order including payment status.

**Endpoint**: `GET /v2/checkout/orders/{order_id}`

**Authentication**:
- Bearer token (OAuth 2.0)
- PayPal-Auth-Assertion header (optional for partner context)

**Response**: Same format as Create Order response

**When to Use**:
- Verifying order status before capture
- Reconciliation and reporting
- Customer service inquiries
- Webhook validation

---

## Step-by-Step Implementation

### Phase 1: Merchant Onboarding (1-2 days)

#### Step 1: Create Partner Referral

Generate onboarding URL for merchant with Google Pay capability:

```typescript
// Generate referral URL with Google Pay capability
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
              "GOOGLE_PAY"  // Request Google Pay capability
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
    return_url_description: "Return to your platform",
    show_add_credit_card: true
  }
});

// Redirect merchant to: referralUrl.action_url
```

**Handler**: `src/modules/merchant-onboarding/trpc-handlers/generate-partner-referral-handler.ts`

#### Step 2: Handle Onboarding Return

```typescript
// Parse return URL parameters
const merchantIdInPayPal = params.get("merchantIdInPayPal");
const permissionsGranted = params.get("permissionsGranted") === "true";

// Store merchant information
await repository.save({
  trackingId,
  saleorApiUrl,
  paypalMerchantId: merchantIdInPayPal,
  onboardingStatus: "completed",
  permissionsGranted,
});
```

#### Step 3: Verify Google Pay Capability

```typescript
const statusResult = await partnerApi.getMerchantStatus(merchantId);

if (statusResult.isErr()) {
  throw new Error("Failed to get merchant status");
}

const status = statusResult.value;

// Check for Google Pay capability
const hasGooglePay = status.capabilities?.some(
  cap => cap.name === "GOOGLE_PAY" && cap.status === "ACTIVE"
);

// Update database
await repository.update(trackingId, {
  googlePayEnabled: hasGooglePay,
  capabilities: status.capabilities,
});

if (hasGooglePay) {
  console.log("✓ Google Pay is enabled and ready");
} else {
  console.log("✗ Google Pay not enabled - contact PayPal support");
}
```

---

### Phase 2: Frontend Integration (2-3 days)

#### Step 1: Add Google Pay Library

**For Web**:
```html
<!-- Add Google Pay script to your HTML -->
<script src="https://pay.google.com/gp/p/js/pay.js"></script>
```

#### Step 2: Initialize Google Pay Client

```typescript
// Initialize Google Pay API
const baseRequest = {
  apiVersion: 2,
  apiVersionMinor: 0
};

const allowedCardNetworks = ["AMEX", "DISCOVER", "MASTERCARD", "VISA"];
const allowedCardAuthMethods = ["PAN_ONLY", "CRYPTOGRAM_3DS"];

const tokenizationSpecification = {
  type: 'PAYMENT_GATEWAY',
  parameters: {
    'gateway': 'paypal',
    'gatewayMerchantId': 'YOUR_PAYPAL_MERCHANT_ID'
  }
};

const baseCardPaymentMethod = {
  type: 'CARD',
  parameters: {
    allowedAuthMethods: allowedCardAuthMethods,
    allowedCardNetworks: allowedCardNetworks
  }
};

const cardPaymentMethod = Object.assign(
  {},
  baseCardPaymentMethod,
  {
    tokenizationSpecification: tokenizationSpecification
  }
);

let paymentsClient = new google.payments.api.PaymentsClient({
  environment: 'TEST' // or 'PRODUCTION'
});
```

#### Step 3: Check Google Pay Availability

```typescript
// Check if Google Pay is available
const isReadyToPayRequest = Object.assign({}, baseRequest);
isReadyToPayRequest.allowedPaymentMethods = [baseCardPaymentMethod];

paymentsClient.isReadyToPay(isReadyToPayRequest)
  .then((response) => {
    if (response.result) {
      // Show Google Pay button
      addGooglePayButton();
    }
  })
  .catch((err) => {
    console.error('Error checking Google Pay availability:', err);
  });
```

#### Step 4: Add Google Pay Button

```typescript
function addGooglePayButton() {
  const button = paymentsClient.createButton({
    onClick: onGooglePaymentButtonClicked,
    buttonColor: 'default',
    buttonType: 'buy',
    buttonSizeMode: 'fill'
  });

  document.getElementById('google-pay-container').appendChild(button);
}
```

#### Step 5: Handle Google Pay Button Click

```typescript
function onGooglePaymentButtonClicked() {
  const paymentDataRequest = Object.assign({}, baseRequest);
  paymentDataRequest.allowedPaymentMethods = [cardPaymentMethod];

  paymentDataRequest.transactionInfo = {
    totalPriceStatus: 'FINAL',
    totalPrice: '100.00',
    currencyCode: 'USD',
    countryCode: 'US'
  };

  paymentDataRequest.merchantInfo = {
    merchantName: 'Your Store Name',
    merchantId: 'YOUR_GOOGLE_MERCHANT_ID'
  };

  // Request shipping address if needed
  paymentDataRequest.shippingAddressRequired = true;
  paymentDataRequest.shippingAddressParameters = {
    allowedCountryCodes: ['US'],
    phoneNumberRequired: true
  };

  paymentsClient.loadPaymentData(paymentDataRequest)
    .then((paymentData) => {
      processPayment(paymentData);
    })
    .catch((err) => {
      console.error('Payment failed:', err);
    });
}
```

#### Step 6: Process Payment

```typescript
async function processPayment(paymentData) {
  try {
    // Extract payment token
    const paymentToken = JSON.parse(
      paymentData.paymentMethodData.tokenizationData.token
    );

    // Send to backend
    const response = await fetch('/api/paypal/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        paymentSource: 'google_pay',
        googlePayToken: paymentToken,
        amount: '100.00',
        currency: 'USD',
        shippingAddress: paymentData.shippingAddress
      })
    });

    const result = await response.json();

    if (result.success) {
      // Redirect to success page
      window.location.href = '/checkout/success?orderId=' + result.orderId;
    } else {
      console.error('Order creation failed:', result.error);
    }
  } catch (error) {
    console.error('Payment processing failed:', error);
  }
}
```

---

### Phase 3: Backend Integration (2 days)

#### Create Order with Google Pay

```typescript
// POST /api/paypal/create-order
export async function POST(request: Request) {
  const {
    googlePayToken,
    amount,
    currency,
    shippingAddress
  } = await request.json();

  try {
    // Get PayPal client with merchant context
    const paypalClient = PayPalClient.create({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      merchantId: merchant.paypalMerchantId,
      bnCode: config.bnCode,
      env: config.environment
    });

    // Create order
    const orderResult = await paypalClient.makeRequest({
      method: "POST",
      path: "/v2/checkout/orders",
      body: {
        intent: "CAPTURE",
        purchase_units: [{
          reference_id: orderId,
          amount: {
            currency_code: currency,
            value: amount
          },
          shipping: {
            name: {
              full_name: shippingAddress.name
            },
            address: {
              address_line_1: shippingAddress.address1,
              admin_area_2: shippingAddress.locality,
              admin_area_1: shippingAddress.administrativeArea,
              postal_code: shippingAddress.postalCode,
              country_code: shippingAddress.countryCode
            }
          }
        }],
        payment_source: {
          google_pay: {
            name: shippingAddress.name,
            email_address: googlePayToken.email,
            decrypted_token: {
              message_id: googlePayToken.messageId,
              message_expiration: googlePayToken.messageExpiration,
              signature: googlePayToken.signature,
              signed_message: googlePayToken.signedMessage,
              protocol_version: googlePayToken.protocolVersion,
              signed_key: googlePayToken.signedKey
            }
          }
        },
        application_context: {
          brand_name: storeName,
          user_action: "PAY_NOW"
        }
      }
    });

    return Response.json({
      success: true,
      orderId: orderResult.id,
      status: orderResult.status
    });
  } catch (error) {
    console.error('Order creation failed:', error);
    return Response.json(
      { success: false, error: 'Order creation failed' },
      { status: 500 }
    );
  }
}
```

---

### Phase 4: Testing (2-3 days)

#### Sandbox Testing

1. **Setup Test Environment**:
   ```typescript
   const paymentsClient = new google.payments.api.PaymentsClient({
     environment: 'TEST'
   });
   ```

2. **Test Cards**:
   - Use test cards from Google Pay documentation
   - Add test cards to Google Pay in test mode

3. **Test Payment Flow**:
   - Click Google Pay button
   - Select test card
   - Complete authorization
   - Verify order creation
   - Check webhook delivery

#### Production Testing Checklist

- [ ] Merchant has Google Pay capability ACTIVE
- [ ] Google Pay button displays correctly on all devices
- [ ] Payment flow completes successfully
- [ ] Order appears in PayPal dashboard
- [ ] Webhooks are received and processed
- [ ] Refunds work correctly
- [ ] Error handling tested (declined cards, network errors)
- [ ] Multi-currency testing completed
- [ ] Mobile web and Android app tested

---

## Frontend Integration

### Complete React Component Example

```tsx
// GooglePayButton.tsx
import { useEffect, useState } from 'react';

interface GooglePayButtonProps {
  amount: string;
  currency: string;
  merchantId: string;
  onSuccess: (orderId: string) => void;
  onError: (error: Error) => void;
}

export const GooglePayButton = ({
  amount,
  currency,
  merchantId,
  onSuccess,
  onError
}: GooglePayButtonProps) => {
  const [paymentsClient, setPaymentsClient] = useState<any>(null);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    // Initialize Google Pay client
    const initGooglePay = async () => {
      if (!window.google) {
        console.error('Google Pay script not loaded');
        return;
      }

      const client = new google.payments.api.PaymentsClient({
        environment: process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'TEST'
      });

      setPaymentsClient(client);

      // Check if ready to pay
      const baseRequest = {
        apiVersion: 2,
        apiVersionMinor: 0
      };

      const isReadyToPayRequest = {
        ...baseRequest,
        allowedPaymentMethods: [{
          type: 'CARD',
          parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['AMEX', 'DISCOVER', 'MASTERCARD', 'VISA']
          }
        }]
      };

      try {
        const response = await client.isReadyToPay(isReadyToPayRequest);
        setAvailable(response.result);
      } catch (err) {
        console.error('Error checking Google Pay availability:', err);
      }
    };

    initGooglePay();
  }, []);

  const handleGooglePayClick = async () => {
    if (!paymentsClient) return;

    const paymentDataRequest = {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [{
        type: 'CARD',
        parameters: {
          allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
          allowedCardNetworks: ['AMEX', 'DISCOVER', 'MASTERCARD', 'VISA']
        },
        tokenizationSpecification: {
          type: 'PAYMENT_GATEWAY',
          parameters: {
            gateway: 'paypal',
            gatewayMerchantId: merchantId
          }
        }
      }],
      merchantInfo: {
        merchantName: 'Your Store Name',
        merchantId: process.env.NEXT_PUBLIC_GOOGLE_MERCHANT_ID
      },
      transactionInfo: {
        totalPriceStatus: 'FINAL',
        totalPrice: amount,
        currencyCode: currency,
        countryCode: 'US'
      },
      shippingAddressRequired: true,
      shippingAddressParameters: {
        allowedCountryCodes: ['US'],
        phoneNumberRequired: true
      }
    };

    try {
      const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);

      // Process payment
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentSource: 'google_pay',
          paymentData: paymentData,
          amount,
          currency
        })
      });

      const result = await response.json();

      if (result.success) {
        onSuccess(result.orderId);
      } else {
        onError(new Error(result.error));
      }
    } catch (error) {
      onError(error as Error);
    }
  };

  useEffect(() => {
    if (paymentsClient && available) {
      const button = paymentsClient.createButton({
        onClick: handleGooglePayClick,
        buttonColor: 'default',
        buttonType: 'buy',
        buttonSizeMode: 'fill'
      });

      const container = document.getElementById('google-pay-button-container');
      if (container) {
        container.innerHTML = '';
        container.appendChild(button);
      }
    }
  }, [paymentsClient, available]);

  if (!available) {
    return null;
  }

  return <div id="google-pay-button-container" />;
};
```

### Styling

```css
/* Google Pay button container */
#google-pay-button-container {
  width: 100%;
  min-height: 48px;
}

/* Custom button styling if needed */
.google-pay-button {
  width: 100%;
  height: 48px;
  border-radius: 8px;
}
```

---

## Testing

### Sandbox Environment

**Test Cards**:
Use the following test cards in Google Pay TEST environment:

| Card Network | Card Number | CVV | Expiry |
|--------------|-------------|-----|--------|
| Visa | 4111 1111 1111 1111 | 123 | Any future date |
| Mastercard | 5555 5555 5555 4444 | 123 | Any future date |
| Amex | 3782 822463 10005 | 1234 | Any future date |

**Testing Checklist**:
- [ ] Google Pay button shows on supported devices
- [ ] Can select payment method
- [ ] Authorization completes successfully
- [ ] Order creates in PayPal
- [ ] Capture works correctly
- [ ] Refunds process successfully
- [ ] Error handling works (declined card, network error)

---

## Troubleshooting

### Common Issues

#### 1. Google Pay Button Not Showing

**Possible Causes**:
- Google Pay script not loaded
- Browser not supported
- No payment methods in Google Pay
- Merchant not configured correctly

**Solutions**:
```typescript
// Check all requirements
const checkGooglePayAvailability = async () => {
  // 1. Check if script loaded
  if (!window.google || !window.google.payments) {
    console.error('Google Pay script not loaded');
    return false;
  }

  // 2. Initialize client
  const client = new google.payments.api.PaymentsClient({
    environment: 'TEST'
  });

  // 3. Check if ready to pay
  try {
    const response = await client.isReadyToPay({
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [{
        type: 'CARD',
        parameters: {
          allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
          allowedCardNetworks: ['VISA', 'MASTERCARD']
        }
      }]
    });

    return response.result;
  } catch (error) {
    console.error('Google Pay not available:', error);
    return false;
  }
};
```

#### 2. Payment Authorization Failed

**Error**: `Payment failed` or `Authorization declined`

**Solutions**:
1. Verify merchant has Google Pay capability:
   ```typescript
   const status = await partnerApi.getMerchantStatus(merchantId);
   const hasGooglePay = status.capabilities?.some(
     cap => cap.name === "GOOGLE_PAY" && cap.status === "ACTIVE"
   );
   ```

2. Check PayPal-Auth-Assertion header:
   ```typescript
   // Ensure merchant ID is included
   const assertion = generateAuthAssertion(
     partnerClientId,
     merchantId  // PayPal Merchant ID required
   );
   ```

3. Verify payment data format:
   ```typescript
   // Ensure all required fields present
   const googlePayData = {
     name: billingAddress.name,
     email_address: email,
     decrypted_token: {
       message_id: token.messageId,
       signature: token.signature,
       // ... all required fields
     }
   };
   ```

#### 3. Order Creation Failed

**Error**: `INVALID_REQUEST` or `UNPROCESSABLE_ENTITY`

**Solutions**:
1. Validate amount format (must be string with 2 decimal places)
2. Ensure all required fields in purchase_units
3. Verify payment_source.google_pay structure
4. Check currency code is supported

#### 4. Capability Not Available

**Error**: Merchant doesn't have GOOGLE_PAY capability

**Solutions**:
1. Contact PayPal Partner Support
2. Request Google Pay capability activation
3. Verify merchant account is business account
4. Check account is in good standing

---

## Documentation References

### Official PayPal Documentation

1. **Google Pay Integration Guide**
   - URL: https://developer.paypal.com/docs/multiparty/checkout/apm/google-pay/
   - Purpose: Main guide for Google Pay integration with PayPal multiparty
   - Key Sections:
     - Prerequisites and merchant requirements
     - Payment flow implementation
     - Integration best practices

2. **Orders API v2 Reference**
   - URL: https://developer.paypal.com/api/rest/reference/orders/v2/orders/
   - Purpose: Complete API reference for order creation
   - Key Endpoints:
     - POST /v2/checkout/orders (Create order with Google Pay)
     - POST /v2/checkout/orders/{id}/capture (Capture payment)
     - GET /v2/checkout/orders/{id} (Get order details)

3. **Google Pay Payment Source**
   - URL: https://developer.paypal.com/docs/checkout/apm/google-pay/
   - Purpose: Documentation for Google Pay payment source object
   - Key Information:
     - Payment source structure
     - Decrypted token format
     - Required and optional fields

4. **Partner Referrals API**
   - URL: https://developer.paypal.com/api/rest/reference/customer-partner-referrals/
   - Purpose: Merchant onboarding API reference
   - Key Endpoints:
     - POST /v2/customer/partner-referrals (Create referral)
     - GET /v2/customer/partners/{}/merchant-integrations/{} (Get capabilities)

5. **PayPal-Auth-Assertion Header**
   - URL: https://developer.paypal.com/api/rest/requests/#paypal-auth-assertion
   - Purpose: Partner authentication header documentation
   - Key Information:
     - Header format requirements
     - Merchant ID vs email usage
     - Troubleshooting tips

### Google Developer Documentation

6. **Google Pay Web Integration**
   - URL: https://developers.google.com/pay/api/web/overview
   - Purpose: Google's official web integration guide
   - Key Information:
     - Google Pay API reference
     - Integration tutorial
     - Best practices

7. **Google Pay API Reference**
   - URL: https://developers.google.com/pay/api/web/reference/request-objects
   - Purpose: Complete JavaScript API reference
   - Key Sections:
     - PaymentDataRequest object
     - PaymentMethodTokenizationSpecification
     - TransactionInfo structure

8. **Google Pay Android Integration**
   - URL: https://developers.google.com/pay/api/android/overview
   - Purpose: Android app integration guide
   - Key Information:
     - Android API setup
     - Payment flow for apps
     - Testing guidelines

### Web Shop Manager Integration Guide

9. **Web Shop Manager - Integration Guide (PDF)**
   - Location: `Web Shop Manager - Integration Guide (3).pdf`
   - Relevant Sections:
     - **Page 19-21**: Google Pay merchant requirements
     - **Page 26-28**: Payment processing with Google Pay
     - **Page 30-32**: Merchant onboarding with payment capabilities
     - **Page 42-44**: Multi-payment method support
     - **Page 50-52**: Error handling and troubleshooting

### Implementation Notes

**Endpoint Source Mapping**:

| Endpoint | Documentation Source | Page/Section |
|----------|---------------------|--------------|
| POST /v2/checkout/orders | PayPal Orders v2 API + WSM Guide | API Ref + Page 26 |
| POST /v2/checkout/orders/{id}/capture | PayPal Orders v2 API | API Reference |
| GET /v2/customer/partners/{}/merchant-integrations/{} | PayPal Partner Referrals API + WSM | API Ref + Page 30 |
| POST /v2/payments/captures/{id}/refund | PayPal Payments API | API Reference |
| POST /v2/customer/partner-referrals | PayPal Multiparty Docs + WSM Guide | Multiparty + Page 30 |

**Key Implementation Details from Documentation**:

1. **Google Pay Payment Source** (from Orders v2 API):
   - Uses `google_pay` object in `payment_source`
   - Requires `decrypted_token` with all token fields
   - Protocol version typically "ECv2"

2. **Merchant Capabilities** (from Partner Referrals API):
   - Check `GOOGLE_PAY` in capabilities array
   - Status must be `ACTIVE`
   - Verify via merchant-integrations endpoint

3. **PayPal-Auth-Assertion** (from REST API Requests docs):
   - Required for partner-managed payments
   - Must include merchant_id in payer_id field
   - Format: `base64(header).base64(payload).`

4. **Tokenization** (from Google Pay Web docs):
   - Gateway parameter must be "paypal"
   - Gateway merchant ID is PayPal merchant ID
   - Token automatically decrypted by PayPal

---

## Summary

Google Pay integration through PayPal requires:

1. ✅ **Merchant has Google Pay capability enabled**
2. ✅ **Frontend integration with Google Pay API**
3. ✅ **Backend order creation with google_pay payment source**
4. ✅ **Proper PayPal-Auth-Assertion header for partner context**
5. ✅ **Handle payment authorization and capture**
6. ✅ **Test in sandbox and production environments**
7. ✅ **Support web and Android platforms**

For support or questions, refer to the official PayPal and Google Pay documentation or contact PayPal Partner Support.
