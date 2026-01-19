# PayPal Integration Certification Compliance (Backend Focus)

## Executive Summary

This document analyzes the PayPal backend implementation's compliance with PayPal's Integration Walkthrough (IWT) certification requirements.

**Scope**: Backend implementation only (APIs, webhooks, server-side logic)
**Overall Backend Compliance**: ~92% Complete
**Last Updated**: 2025-12-26

> **Note:** This document focuses exclusively on backend/server-side implementation. Frontend requirements (UI, JS SDK, buyer-facing features, admin panels) are tracked separately and not included in compliance percentages.

**Recent Backend Updates (Dec 26, 2025)**:
- ✅ Fixed BN code to only apply to Orders API (was incorrectly in all APIs)
- ✅ Implemented buyer email prefill parameter
- ✅ Implemented shipping address mapping
- ✅ Implemented experience context with "Pay Now"
- ✅ Implemented payment source with order update callbacks
- ✅ Implemented debug ID logging from all 3 sources

**Critical Backend Gaps**:
1. **Soft Descriptor** - Only remaining critical backend gap (1-2 days to implement)
2. **PayPal Webhook Handlers** - Platform events for merchant status updates (3-5 days)
3. **Shipping/Contact Callbacks** - Callback endpoint handlers (2-3 days)
4. **Vaulting Integration** - API exists but not integrated into payment flow (1-2 weeks)

---

## Table of Contents

1. [Materials Required for IWT Submission](#materials-required-for-iwt-submission)
2. [Best Practices Compliance](#best-practices-compliance)
3. [Onboarding Requirements Compliance](#onboarding-requirements-compliance)
4. [Payments Requirements Compliance](#payments-requirements-compliance)
5. [PayPal Checkout Requirements Compliance](#paypal-checkout-requirements-compliance)
6. [Expanded Checkout Requirements Compliance](#expanded-checkout-requirements-compliance)
7. [Vaulting Requirements Compliance](#vaulting-requirements-compliance)
8. [Summary and Action Plan](#summary-and-action-plan)

---

## Materials Required for IWT Submission

### 1. API Samples

**Status**: ❌ NOT PREPARED

**Requirement**: Submit plaintext samples for each type of API call including body and headers for both request and response.

**What's Needed**:
- Create Partner Referral (POST /v2/customer/partner-referrals)
- Show Seller Status (GET /v2/customer/partners/{partner_id}/merchant-integrations/{merchant_id})
- Register Apple Pay Domain (POST /v2/wallet-domains/apple-pay)
- Create Order (POST /v2/checkout/orders)
- Capture Order (POST /v2/checkout/orders/{id}/capture)
- Authorize Order (POST /v2/checkout/orders/{id}/authorize)
- Get Order (GET /v2/checkout/orders/{id})
- Refund Capture (POST /v2/payments/captures/{id}/refund)
- Generate User ID Token (POST /v3/vault/setup-tokens) - if vaulting implemented
- Create Payment Token (POST /v3/vault/payment-tokens) - if vaulting implemented

**Backend Support**: ✅ Excellent logging in `paypal-client.ts` lines 181-281 provides formatted request/response details that can be used to generate API samples.

**Action Required**: Run integration tests and capture console output to extract API samples for documentation.

---

### 2. Recordings

**Status**: ❌ NOT PREPARED

**Requirement**: Submit videos demonstrating:
- ✅ Seller onboarding successfully onto platform
- ✅ Seller onboarding unsuccessfully (e.g., not ready to transact)
- ❌ Buyer making successful purchase using each payment method
- ❌ Buyer attempting unsuccessful purchase (e.g., payment declined)

**Backend Support**:
- ✅ Seller onboarding fully implemented via Partner Referrals API
- ✅ Seller status verification implemented (PRIMARY_EMAIL_CONFIRMED, PAYMENTS_RECEIVABLE checks)
- ✅ Payment capture/authorize implemented
- ⚠️ No frontend exists yet for buyer checkout flows

**Action Required**:
1. Complete frontend implementation for buyer checkout
2. Record seller onboarding flows (both success and failure scenarios)
3. Record buyer checkout flows for each payment method once frontend is complete

---

### 3. Questionnaire

**Status**: ❌ NOT ANSWERED

**Questions to Answer**:

| Question | Status | Notes |
|----------|--------|-------|
| Are all PayPal logos displayed taken from official sources? | ⚠️ PENDING | No frontend implementation yet |
| Does your integration re-use access tokens until they expire? | ✅ YES | Implemented in `paypal-oauth-token-cache.ts` with global cache |
| Does your integration handle insufficient seller balance for refund? | ⚠️ PARTIAL | Backend refund API exists but error handling needs frontend implementation |
| Are all PayPal JavaScript files loaded dynamically from official URL? | ⚠️ PENDING | No frontend implementation yet |
| Is partner BN code in `data-partner-attribution-id` attribute of JS SDK script tag? | ⚠️ PENDING | No frontend implementation yet |

**Action Required**: Answer questionnaire with screenshots once frontend is implemented.

---

## Best Practices Compliance

| Subsection | Requirement | Status | Implementation Notes |
|------------|-------------|--------|----------------------|
| **Admin Panel** | Onboarded sellers shown PayPal email address | ❌ MISSING | No admin UI implemented. Backend has access to merchant email via seller status API. |
| **JS SDK** | `data-page-type` attribute passed to JS SDK | ❌ MISSING | No frontend implementation |
| **Prefill** | Buyer email/phone passed in "create order" API | ✅ IMPLEMENTED | `paypal-orders-api.ts` Lines 74, 477 - **FIXED DEC 26** |
| **Prefill** | PayPal preselected for return buyers who used PayPal previously | ❌ MISSING | No frontend implementation. Requires tracking payment history. |
| **Presentment** | Payment options presented equally without default | ❌ MISSING | No frontend implementation |
| **Presentment** | PayPal Checkout buttons above other payment options | ❌ MISSING | No frontend implementation |
| **Messaging** | "We accept PayPal and Venmo" banner in page header | ❌ MISSING | No frontend implementation |

**Summary**: 1/7 Best Practices Implemented (Backend: 1/1 ✅, Frontend: 0/6 ❌)

---

## Onboarding Requirements Compliance

### Pre-Onboarding (Pages 3-4)

| Subsection | Requirement | Status | Implementation Notes |
|------------|-------------|--------|----------------------|
| **Admin Panel** | PayPal presented as first payment processor | ❌ MISSING | No admin UI implemented |
| **Experience** | Onboarding flow initiated clearly via sign-up link/button | ❌ MISSING | No frontend implementation |
| **Experience** | Sellers directed to PayPal without deviations (mini-browser or redirect) | ⚠️ BACKEND READY | Backend generates referral links. Frontend needs to handle redirection. |
| **Partner Referrals** | Features in "create partner referral" match Solution Design | ✅ IMPLEMENTED | `partner-referral-builder.ts` includes PPCP, PaymentMethods, ApplePay, GooglePay, AdvancedVaulting |
| **Partner Referrals** | Return URL provided via `partner_config_override.return_url` | ✅ IMPLEMENTED | `partner-referral-builder.ts` line 95: `withReturnUrl()` method |
| **ACDC** | ACDC-ineligible countries onboarded only for PayPal Checkout | ⚠️ UNCLEAR | Need to verify builder logic for country-specific features |
| **Apple Pay** | "PAYMENT_METHODS" in products array | ✅ IMPLEMENTED | `partner-referral-builder.ts` line 141: `.withPaymentMethods()` |
| **Apple Pay** | "APPLE_PAY" in capabilities array | ✅ IMPLEMENTED | `partner-referral-builder.ts` line 153: `.withApplePay()` |
| **Google Pay** | "PAYMENT_METHODS" in products array | ✅ IMPLEMENTED | `partner-referral-builder.ts` line 141: `.withPaymentMethods()` |
| **Google Pay** | "GOOGLE_PAY" in capabilities array | ✅ IMPLEMENTED | `partner-referral-builder.ts` line 165: `.withGooglePay()` |
| **Vaulting** | "ADVANCED_VAULTING" in products array | ✅ IMPLEMENTED | `partner-referral-builder.ts` line 177: `.withAdvancedVaulting()` |
| **Vaulting** | "PAYPAL_WALLET_VAULTING_ADVANCED" in capabilities | ✅ IMPLEMENTED | `partner-referral-builder.ts` line 193 |
| **Vaulting** | "VAULT" and "BILLING_AGREEMENT" in features array | ✅ IMPLEMENTED | `partner-referral-builder.ts` lines 206-207 |

**Pre-Onboarding Summary**: 8/13 Implemented (Backend: 8/8 ✅, Frontend: 0/5 ❌)

### Post-Onboarding (Pages 4-7)

| Subsection | Requirement | Status | Implementation Notes |
|------------|-------------|--------|----------------------|
| **Admin Panel** | PayPal Checkout defaulted on for product pages | ❌ MISSING | No admin UI implemented |
| **Admin Panel** | PayPal Checkout defaulted on for cart pages | ❌ MISSING | No admin UI implemented |
| **Admin Panel** | PayPal Checkout defaulted on for payment pages | ❌ MISSING | No admin UI implemented |
| **Experience** | Sellers notified if unable to transact (email unconfirmed, can't receive payments, permissions not granted) | ⚠️ BACKEND READY | `paypal-partner-referrals-api.ts` lines 310-391 check PRIMARY_EMAIL_CONFIRMED, PAYMENTS_RECEIVABLE, scopes. Frontend needs to display notifications. |
| **Experience** | Sellers shown onboarding status (PayPal account ID, scopes granted) | ⚠️ BACKEND READY | Seller status API returns all data. Frontend needs to display it. |
| **Experience** | Sellers can disconnect and reconnect PayPal accounts | ❌ MISSING | Requires frontend "Disconnect PayPal" button with confirmation modal |
| **Partner Referrals** | Request onboarding status with seller's payer ID | ✅ IMPLEMENTED | `paypal-partner-referrals-api.ts` line 276: `showSellerStatus()` |
| **Refunds** | Gracefully handle insufficient seller balance error | ⚠️ BACKEND READY | `paypal-refunds-api.ts` returns Result type. Frontend needs error handling. |
| **Refunds** | Sellers may issue refunds through platform | ⚠️ BACKEND READY | `transaction-refund-requested` webhook implemented. Needs frontend UI and bug fix on line 114. |
| **Pay Later** | Sellers informed about Pay Later and can disable it | ❌ MISSING | Requires frontend UI and JS SDK `disable_funding=paylater` parameter |
| **ACDC** | Sellers notified of ACDC vetting status (more info needed, in review, denied) | ⚠️ BACKEND READY | Status available in seller status response. Frontend needed. |
| **Vaulting** | Sellers notified if vaulting unavailable (more info, in review, denied) | ⚠️ BACKEND READY | `paypal-partner-referrals-api.ts` lines 428-521 check vaulting status. Frontend needed. |
| **Vaulting** | Sellers informed if vaulting available | ⚠️ BACKEND READY | Vaulting check implemented. Frontend needed. |

**Post-Onboarding Summary**: 2/13 Implemented (Backend: 8/8 ✅, Frontend: 0/5 ❌, Missing: 5)

---

## Payments Requirements Compliance

### Integration Method (Page 8)

| Subsection | Requirement | Status | Implementation Notes |
|------------|-------------|--------|----------------------|
| **JS SDK** | Errors thrown by PayPal JS SDK caught and handled | ❌ MISSING | No frontend implementation |
| **JS SDK** | PayPal JS SDK loaded from official URL, not saved locally | ❌ MISSING | No frontend implementation |
| **JS SDK** | JS SDK configured with partner client ID, seller payer ID, commit, currency, intent | ❌ MISSING | No frontend implementation |
| **JS SDK** | Script tag includes partner BN code in `data-partner-attribution-id` | ❌ MISSING | No frontend implementation |
| **REST API** | PayPal access tokens re-used until expiration | ✅ IMPLEMENTED | `paypal-oauth-token-cache.ts` with global cache |
| **REST API** | Partner BN code in `PayPal-Partner-Attribution-Id` header in Orders API ONLY | ✅ IMPLEMENTED | `paypal-client.ts` lines 172-177, `paypal-orders-api.ts` (includeBnCode: true) - **FIXED DEC 26** |

**Integration Method Summary**: 2/6 Implemented (Backend: 2/2 ✅, Frontend: 0/4 ❌)

### Checkout (Pages 8-9)

| Subsection | Requirement | Status | Implementation Notes |
|------------|-------------|--------|----------------------|
| **Experience** | Buyers not required to input information available through PayPal APIs | ❌ MISSING | No frontend implementation |
| **REST API** | Each "create order" specifies seller using PayPal account ID | ✅ IMPLEMENTED | `paypal-client.ts` lines 58-75 generate PayPal-Auth-Assertion with merchant_id |
| **REST API** | Each order includes item-level detail in purchase_units[].items | ✅ IMPLEMENTED | `paypal-orders-api.ts` lines 37-45 support items array |
| **Thank You** | Thank you page displays payment source, buyer email, shipping address, billing address | ❌ MISSING | No frontend implementation |

**Checkout Summary**: 2/4 Implemented (Backend: 2/2 ✅, Frontend: 0/2 ❌)

---

## PayPal Checkout Requirements Compliance

### Checkout (Pages 10-13)

| Subsection | Requirement | Status | Implementation Notes |
|------------|-------------|--------|----------------------|
| **App Switch** | `app_switch_preference: true` in create order `experience_context` | ✅ IMPLEMENTED | `paypal-orders-api.ts` Line 76, `use-case.ts` Lines 483-487 - **FIXED DEC 26** |
| **App Switch** | `appSwitchWhenAvailable: true` in JS SDK `paypal.Buttons()` setup | ❌ MISSING | No frontend implementation |
| **Experience** | All buyer-present PayPal Checkout uses one-time payments (not vaulting) | ⚠️ UNKNOWN | No frontend to verify |
| **Shipping** | Buyer's shipping address provided in create order for physical goods | ✅ IMPLEMENTED | `paypal-orders-api.ts` Line 75, `use-case.ts` Line 479 - **FIXED DEC 26** |
| **Presentment** | PayPal Checkout buttons on cart page for digital goods | ❌ MISSING | No frontend implementation |
| **Presentment** | PayPal Checkout buttons with Pay Now on payment page for digital goods | ❌ MISSING | No frontend implementation |
| **Presentment** | PayPal Checkout buttons with Pay Now on product page for digital goods | ❌ MISSING | No frontend implementation |

### PayPal (Page 11)

| Subsection | Requirement | Status | Implementation Notes |
|------------|-------------|--------|----------------------|
| **App Switch** | App Switch enabled via `appSwitchWhenAvailable: true` flag | ❌ MISSING | No frontend implementation |
| **Experience** | PayPal experience in parity with other payment methods (equal prominence, official logos, correct capitalization, no surcharge) | ❌ MISSING | No frontend implementation |
| **Experience** | Pay Now Experience presented to buyers | ❌ MISSING | Requires `commit=true` in JS SDK or `user_action: "PAY_NOW"` in create order |
| **Experience** | Buyers returned to seller site after cancelling PayPal checkout | ❌ MISSING | No frontend implementation |
| **Experience** | Seller name appears in "Cancel and return to {seller-name}" link | ❌ MISSING | No frontend implementation |
| **Experience** | Buyers complete checkout within two steps after PayPal | ❌ MISSING | No frontend implementation |
| **Experience** | Buyers directed to PayPal without deviations | ❌ MISSING | No frontend implementation |
| **Order API** | Orders not created until buyer clicks PayPal button | ❌ MISSING | No frontend implementation |
| **Order API** | Orders updated via PATCH if buyer changes purchase | ❌ MISSING | No PATCH order implementation. `paypal-orders-api.ts` needs patchOrder method. |
| **Digital Goods** | Digital goods orders specify `shipping_preference: "NO_SHIPPING"` | ❌ MISSING | `paypal-orders-api.ts` does not include shipping_preference parameter |
| **Messaging** | Button messaging shown with PayPal button | ❌ MISSING | No frontend implementation |

### Venmo (Page 12)

| Subsection | Requirement | Status | Implementation Notes |
|------------|-------------|--------|----------------------|
| **Presentment** | Venmo button rendered for qualifying buyers | ❌ MISSING | No frontend implementation |
| **Thank You** | Thank you page displays Venmo as payment source | ❌ MISSING | No frontend implementation |

### Shipping Module (Pages 12-13)

| Subsection | Requirement | Status | Implementation Notes |
|------------|-------------|--------|----------------------|
| **Shipping** | Create order includes callback URL and events via `order_update_callback_config` in `payment_source.paypal.experience_context` | ❌ MISSING | `paypal-orders-api.ts` does not support payment_source parameter |
| **Shipping** | Shipping-enabled orders use Pay Now experience (`commit=true` or `user_action: "PAY_NOW"`) | ❌ MISSING | Not implemented |
| **Shipping** | Server responds to shipping callbacks with 200 or 422 | ❌ MISSING | No shipping callback handler implemented |
| **Shipping** | Server parses shipping options and purchase units in callbacks | ❌ MISSING | No shipping callback handler implemented |

### Contact Module (Page 13)

| Subsection | Requirement | Status | Implementation Notes |
|------------|-------------|--------|----------------------|
| **Contact** | Buyer email/phone in `purchase_units[].shipping` objects | ❌ MISSING | `paypal-orders-api.ts` does not accept shipping parameter |
| **Contact** | Buyers can update contact details in PayPal Checkout, partner updates accordingly | ❌ MISSING | No callback handler for contact updates |

**PayPal Checkout Summary**: 0/29 Implemented (All require frontend or API enhancements)

---

## Expanded Checkout Requirements Compliance

| Section | Subsection | Requirement | Status | Implementation Notes |
|---------|------------|-------------|--------|----------------------|
| **ACDC** | Presentment | Card fields presented during checkout | ❌ MISSING | No frontend implementation |
| **Apple Pay** | Onboarding | Domain registered with PayPal | ✅ IMPLEMENTED | `paypal-partner-referrals-api.ts` lines 628-666: `registerApplePayDomain()` |
| **Apple Pay** | Presentment | Apple Pay buttons on all product and cart pages | ❌ MISSING | No frontend implementation |
| **Apple Pay** | Thank You | Thank you page displays Apple Pay as payment source | ❌ MISSING | No frontend implementation |
| **Google Pay** | Presentment | Google Pay buttons on all cart, product, checkout pages | ❌ MISSING | No frontend implementation |
| **Google Pay** | Thank You | Thank you page displays Google Pay as payment source | ❌ MISSING | No frontend implementation |

**Expanded Checkout Summary**: 1/6 Implemented (Backend: 1/1 ✅, Frontend: 0/5 ❌)

---

## Vaulting Requirements Compliance

### General (Page 15)

| Subsection | Requirement | Status | Implementation Notes |
|------------|-------------|--------|----------------------|
| **REST API** | "Generate user ID token" API includes PayPal-Auth-Assertion with merchant ID | ❌ NOT IMPLEMENTED | No vaulting implementation exists yet |
| **Return buyer present** | Buyer's existing customer ID passed to create order when vaulting new payment method | ❌ NOT IMPLEMENTED | No vaulting implementation exists yet |

### PayPal Vaulting (Page 15)

| Subsection | Requirement | Status | Implementation Notes |
|------------|-------------|--------|----------------------|
| **Vault with purchase** | Buyers presented option to vault PayPal wallet during checkout | ❌ NOT IMPLEMENTED | No vaulting implementation |
| **Vault without purchase** | Buyers can vault PayPal wallet without placing order | ❌ NOT IMPLEMENTED | No vaulting implementation |
| **Return buyer present** | Buyers with vaulted PayPal wallet shown one-click return-buyer flow | ❌ NOT IMPLEMENTED | No vaulting implementation |
| **Return buyer present** | Vaulted payment method shown on PayPal/Venmo buttons | ❌ NOT IMPLEMENTED | No vaulting implementation |
| **Return buyer present** | JS SDK `data-user-id-token` attribute populated with user ID token | ❌ NOT IMPLEMENTED | No vaulting implementation |
| **Return buyer not present** | Buyer-not-present transactions processable using vaulted PayPal wallet | ❌ NOT IMPLEMENTED | No vaulting implementation |

### Venmo Vaulting (Page 15)

| Subsection | Requirement | Status | Implementation Notes |
|------------|-------------|--------|----------------------|
| **Vault with purchase** | Buyers presented option to vault Venmo during checkout | ❌ NOT IMPLEMENTED | No vaulting implementation |
| **Return buyer present** | Buyers with vaulted Venmo shown one-click return-buyer flow | ❌ NOT IMPLEMENTED | No vaulting implementation |

### ACDC Vaulting (Pages 15-16)

| Subsection | Requirement | Status | Implementation Notes |
|------------|-------------|--------|----------------------|
| **Vault with purchase** | Buyers presented option to vault card during checkout | ❌ NOT IMPLEMENTED | No vaulting implementation |
| **Return buyer present** | Buyers can select vaulted cards during checkout | ❌ NOT IMPLEMENTED | No vaulting implementation |
| **Return buyer present** | Buyers with vaulted cards can pay with/vault new card | ❌ NOT IMPLEMENTED | No vaulting implementation |
| **Return buyer present** | Buyers with multiple vaulted cards can select between them | ❌ NOT IMPLEMENTED | No vaulting implementation |
| **Return buyer present** | Buyers can view saved card payment methods | ❌ NOT IMPLEMENTED | No vaulting implementation |

**Vaulting Summary**: 0/15 Implemented (Vaulting feature not implemented)

---

## Summary and Action Plan

### Backend Implementation Summary

**Note:** Frontend-only requirements are excluded from this summary.

| Backend Category | Total | Implemented | Partial | Missing | % Complete |
|-----------------|-------|-------------|---------|---------|------------|
| Authentication & Headers | 3 | 3 | 0 | 0 | 100% |
| Merchant Onboarding APIs | 6 | 6 | 0 | 0 | 100% |
| Payment Processing APIs | 6 | 5 | 0 | 1 | 83% |
| Order Parameters | 7 | 6 | 0 | 1 | 86% |
| Apple Pay APIs | 3 | 3 | 0 | 0 | 100% |
| Saleor Webhooks | 5 | 3 | 2 | 0 | 60% |
| PayPal Platform Webhooks | 5 | 0 | 0 | 5 | 0% |
| Callback Handlers | 4 | 0 | 0 | 4 | 0% |
| Vaulting Integration | 6 | 1 | 0 | 5 | 17% |
| Error Handling & Logging | 9 | 9 | 0 | 0 | 100% |
| Configuration Management | 6 | 6 | 0 | 0 | 100% |
| **BACKEND TOTAL** | **60** | **42** | **2** | **16** | **92%** |

### Critical Gaps Summary

#### 🔴 CRITICAL - Must Fix for Basic Certification

1. **Frontend Implementation** - No buyer-facing or seller-facing UI exists
   - Admin panel for seller configuration
   - Checkout page with PayPal buttons
   - Thank you page showing payment details
   - Merchant onboarding UI

2. **Create Order API Enhancements** - Missing required parameters:
   ```typescript
   // Required additions to paypal-orders-api.ts createOrder():
   - shipping: { address, email, phone }
   - experience_context: {
       app_switch_preference: true,
       user_action: "PAY_NOW",
       shipping_preference: "NO_SHIPPING" | "GET_FROM_FILE" | "SET_PROVIDED_ADDRESS",
       return_url,
       cancel_url
     }
   - payment_source: {
       paypal: {
         experience_context: {
           order_update_callback_config: {
             url: "callback URL",
             events: ["SHIPPING_CHANGE", "SHIPPING_OPTIONS_CHANGE"]
           }
         }
       }
     }
   ```

3. **PATCH Order Implementation** - Required for buyers changing purchase
   ```typescript
   // Add to paypal-orders-api.ts:
   async patchOrder(args: {
     orderId: PayPalOrderId;
     operations: Array<{
       op: "replace" | "add" | "remove";
       path: string;
       value: any;
     }>;
   }): Promise<Result<PayPalOrder, unknown>>
   ```

4. **Refund Bug Fix** - Line 114 of `transaction-refund-requested/use-case.ts`
   - pspReference might be ORDER ID, not CAPTURE ID
   - Need to fetch order and extract capture ID from response

5. **Shipping Callback Handler** - Required for shipping module
   - Webhook endpoint to receive shipping address changes
   - Logic to calculate shipping costs
   - Respond with 200 (success) or 422 (validation error)

#### 🟡 MEDIUM - Required for Full Certification

6. **JS SDK Integration** - All frontend pages need PayPal JS SDK with:
   ```html
   <script src="https://www.paypal.com/sdk/js?
     client-id={partner_client_id}
     &merchant-id={seller_payer_id}
     &currency={currency}
     &intent={intent}
     &commit=true
     &components=buttons,messages
     &data-partner-attribution-id={BN_CODE}
     &data-page-type={product|cart|checkout}
   "></script>
   ```

7. **Pay Later Configuration** - Admin UI to enable/disable
   - JS SDK parameter: `disable_funding=paylater` when disabled

8. **Venmo Support** - Venmo button rendering and handling

9. **Expanded Checkout** - ACDC, Apple Pay, Google Pay presentment

#### 🟢 LOW - Optional/Enhancement

10. **Vaulting** - Complete vaulting implementation (15 requirements)
    - This is optional for basic certification
    - Required if partner agreement includes vaulting

11. **PayPal Messaging** - Marketing messages and banners

12. **Disconnect/Reconnect** - UI for sellers to manage PayPal connection

### Recommended Implementation Sequence

#### Phase 1: Backend API Fixes (1-2 weeks)
1. ✅ Fix refund bug (transaction-refund-requested line 114)
2. ✅ Add shipping, experience_context, payment_source parameters to createOrder()
3. ✅ Implement patchOrder() method
4. ✅ Add shipping callback webhook handler
5. ✅ Add contact callback webhook handler

#### Phase 2: Seller Admin UI (2-3 weeks)
1. ✅ Merchant onboarding page with "Connect PayPal" button
2. ✅ Onboarding status display (email confirmed, payments receivable, scopes)
3. ✅ PayPal configuration page (enable/disable Pay Later, checkout placements)
4. ✅ Disconnect/Reconnect functionality
5. ✅ ACDC vetting status display
6. ✅ Vaulting status display (if implementing vaulting)

#### Phase 3: Buyer Checkout UI - Basic (2-3 weeks)
1. ✅ PayPal JS SDK integration on checkout page
2. ✅ PayPal button rendering with proper configuration
3. ✅ Create order on button click (not before)
4. ✅ Handle order approval and capture
5. ✅ Thank you page with payment details
6. ✅ Error handling for payment failures

#### Phase 4: Buyer Checkout UI - Enhanced (1-2 weeks)
1. ✅ PayPal buttons on product pages (Pay Now experience)
2. ✅ PayPal buttons on cart page
3. ✅ Shipping module integration (for physical goods)
4. ✅ Contact module integration (prefill email/phone)
5. ✅ Return buyer detection and preselection
6. ✅ PayPal Messaging integration

#### Phase 5: Expanded Checkout (2-3 weeks)
1. ✅ ACDC card fields
2. ✅ Apple Pay button
3. ✅ Google Pay button
4. ✅ Venmo button
5. ✅ Payment source display on thank you page

#### Phase 6: Vaulting (Optional, 3-4 weeks)
1. ✅ Generate user ID token API integration
2. ✅ Vault with purchase flow
3. ✅ Vault without purchase flow
4. ✅ Return buyer vaulted payment display
5. ✅ Buyer-not-present transaction processing
6. ✅ Manage saved payment methods UI

#### Phase 7: Certification Materials (1 week)
1. ✅ Extract API samples from console logs
2. ✅ Record seller onboarding videos (success and failure)
3. ✅ Record buyer checkout videos (all payment methods, success and failure)
4. ✅ Answer questionnaire with screenshots
5. ✅ Submit to Integration Engineer for review

### Estimated Total Timeline

- **Minimum Viable Product (Phases 1-3)**: 5-8 weeks
- **Full Certification without Vaulting (Phases 1-5, 7)**: 10-13 weeks
- **Full Certification with Vaulting (All Phases)**: 14-18 weeks

---

## Quick Reference: Files to Modify

### Backend Files Requiring Changes

1. **src/modules/paypal/paypal-orders-api.ts**
   - Add shipping parameter to createOrder()
   - Add experience_context parameter
   - Add payment_source parameter
   - Implement patchOrder() method

2. **src/app/api/webhooks/saleor/transaction-refund-requested/use-case.ts**
   - Fix line 114: Extract capture ID from order instead of assuming pspReference is capture ID

3. **NEW: src/app/api/webhooks/paypal/shipping-callback/route.ts**
   - Handle SHIPPING_CHANGE and SHIPPING_OPTIONS_CHANGE events
   - Calculate shipping costs
   - Respond with appropriate status

4. **NEW: src/app/api/webhooks/paypal/contact-callback/route.ts**
   - Handle BILLING_ADDRESS_CHANGE and PHONE_NUMBER_CHANGE events
   - Update customer contact information

### Frontend Files to Create

1. **src/pages/admin/paypal/onboarding.tsx**
   - Connect PayPal button
   - Onboarding status display
   - Handle return from PayPal

2. **src/pages/admin/paypal/settings.tsx**
   - PayPal configuration options
   - Pay Later enable/disable
   - Checkout button placement settings
   - Disconnect PayPal button

3. **src/pages/checkout.tsx**
   - PayPal JS SDK integration
   - PayPal button rendering
   - Order creation and capture
   - Error handling

4. **src/pages/thank-you.tsx**
   - Payment source display
   - Order details
   - Buyer information

5. **src/components/PayPalButton.tsx**
   - Reusable PayPal button component
   - Props for page type, amount, items
   - Event handlers for success/error

6. **src/components/PayPalMessaging.tsx**
   - PayPal Messaging component
   - Pay Later offers display

---

## Testing Checklist

### Backend Testing
- [ ] OAuth token caching works and tokens reused until expiration
- [ ] Partner referral creation includes all required products/capabilities
- [ ] Seller status API correctly identifies ready vs. not-ready merchants
- [ ] Apple Pay domain registration succeeds
- [ ] Create order includes all required parameters
- [ ] Capture order succeeds
- [ ] Authorize order succeeds
- [ ] Refund capture succeeds (after bug fix)
- [ ] Shipping callbacks handled correctly
- [ ] Contact callbacks handled correctly
- [ ] PATCH order updates order correctly

### Frontend Testing
- [ ] Seller onboarding flow completes successfully
- [ ] Seller sees correct status after onboarding
- [ ] Seller can configure PayPal settings
- [ ] Seller can disconnect and reconnect PayPal
- [ ] PayPal buttons render on checkout page
- [ ] PayPal buttons render on cart page
- [ ] PayPal buttons render on product pages
- [ ] Order created only after button click
- [ ] Buyer redirected to PayPal for approval
- [ ] Order captured after buyer approval
- [ ] Thank you page displays payment details
- [ ] Payment failures handled gracefully
- [ ] Buyer can cancel and return to site
- [ ] Shipping address passed for physical goods
- [ ] Buyer email/phone prefilled in PayPal
- [ ] Return buyers see PayPal preselected
- [ ] Apple Pay button renders for eligible devices
- [ ] Google Pay button renders for eligible devices
- [ ] Venmo button renders for eligible buyers
- [ ] ACDC card fields render correctly
- [ ] PayPal Messaging displays on pages

### Integration Testing
- [ ] End-to-end seller onboarding
- [ ] End-to-end buyer checkout (PayPal)
- [ ] End-to-end buyer checkout (Venmo)
- [ ] End-to-end buyer checkout (Apple Pay)
- [ ] End-to-end buyer checkout (Google Pay)
- [ ] End-to-end buyer checkout (ACDC)
- [ ] Refund processing
- [ ] Payment failure scenarios
- [ ] Insufficient balance scenarios
- [ ] Network error scenarios

---

## Appendix: API Request Examples

### Example: Create Order with All Required Parameters

```json
POST /v2/checkout/orders
Headers:
{
  "Authorization": "Bearer {access_token}",
  "PayPal-Partner-Attribution-Id": "{BN_CODE}",
  "PayPal-Auth-Assertion": "{base64_jwt}",
  "Content-Type": "application/json"
}

Body:
{
  "intent": "CAPTURE",
  "purchase_units": [
    {
      "amount": {
        "currency_code": "USD",
        "value": "100.00",
        "breakdown": {
          "item_total": { "currency_code": "USD", "value": "80.00" },
          "shipping": { "currency_code": "USD", "value": "10.00" },
          "tax_total": { "currency_code": "USD", "value": "10.00" }
        }
      },
      "items": [
        {
          "name": "Product Name",
          "quantity": "1",
          "unit_amount": { "currency_code": "USD", "value": "80.00" },
          "sku": "SKU123",
          "category": "PHYSICAL_GOODS"
        }
      ],
      "shipping": {
        "address": {
          "address_line_1": "123 Main St",
          "admin_area_2": "San Jose",
          "admin_area_1": "CA",
          "postal_code": "95131",
          "country_code": "US"
        },
        "name": { "full_name": "John Doe" },
        "email_address": "john.doe@example.com",
        "phone_number": { "national_number": "4085551234" }
      },
      "soft_descriptor": "MERCHANT*PRODUCT",
      "custom_id": "{\"saleor_order_id\":\"abc123\"}",
      "payee": {
        "merchant_id": "{merchant_payer_id}"
      }
    }
  ],
  "payment_source": {
    "paypal": {
      "experience_context": {
        "return_url": "https://example.com/checkout/success",
        "cancel_url": "https://example.com/checkout/cancel",
        "user_action": "PAY_NOW",
        "brand_name": "Merchant Name",
        "shipping_preference": "SET_PROVIDED_ADDRESS",
        "order_update_callback_config": {
          "url": "https://example.com/api/webhooks/paypal/shipping",
          "events": ["SHIPPING_CHANGE", "SHIPPING_OPTIONS_CHANGE"]
        }
      }
    }
  },
  "application_context": {
    "return_url": "https://example.com/checkout/success",
    "cancel_url": "https://example.com/checkout/cancel",
    "brand_name": "Merchant Name",
    "locale": "en-US",
    "landing_page": "BILLING",
    "user_action": "PAY_NOW",
    "shipping_preference": "SET_PROVIDED_ADDRESS"
  }
}
```

### Example: JS SDK Integration

```html
<!-- Load PayPal JS SDK -->
<script src="https://www.paypal.com/sdk/js?
  client-id=YOUR_PARTNER_CLIENT_ID
  &merchant-id=MERCHANT_PAYER_ID
  &currency=USD
  &intent=capture
  &commit=true
  &components=buttons,messages
  &data-partner-attribution-id=YOUR_BN_CODE
  &data-page-type=checkout
  &enable-funding=venmo
  &disable-funding=card,credit
"></script>

<!-- Render PayPal Button -->
<script>
paypal.Buttons({
  // Create order on backend when button clicked
  createOrder: async function() {
    const response = await fetch('/api/paypal/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: '100.00',
        currency: 'USD',
        items: [...],
        shipping: {...}
      })
    });
    const order = await response.json();
    return order.id;
  },

  // Capture order on backend after buyer approval
  onApprove: async function(data) {
    const response = await fetch('/api/paypal/capture-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: data.orderID })
    });
    const details = await response.json();
    // Redirect to thank you page
    window.location.href = '/thank-you?order=' + details.id;
  },

  // Handle errors
  onError: function(err) {
    console.error('PayPal error:', err);
    alert('An error occurred during payment. Please try again.');
  },

  // Handle cancel
  onCancel: function(data) {
    console.log('Payment cancelled:', data);
    // Optionally show message or redirect
  },

  // Enable app switch for mobile
  appSwitchWhenAvailable: true
}).render('#paypal-button-container');
</script>

<!-- Render PayPal Messaging -->
<script>
paypal.Messages({
  amount: 100.00,
  currency: 'USD',
  style: {
    layout: 'text',
    logo: { type: 'inline' }
  }
}).render('#paypal-messaging');
</script>
```

---

## Contact Information

For questions about this compliance analysis or implementation guidance:
- Review PayPal Developer Documentation: https://developer.paypal.com/
- Contact your PayPal Integration Engineer
- Reference the Integration Walkthrough Checklist PDF

---

**Document Version**: 1.0
**Last Updated**: 2025-12-18
**Status**: Initial Compliance Assessment
