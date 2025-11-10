import { z } from "zod";
import { PayPalPartnerReferralId } from "../paypal-partner-referral-id";

/**
 * PayPal Partner Referrals API Types
 * Based on Partner Referrals V2 API
 * https://developer.paypal.com/api/partner-referrals/v2/
 */

// Products that can be requested during onboarding
export const PayPalProductSchema = z.enum([
  "ALIPAY",
  "BANCONTACT",
  "BLIK",
  "EPS",
  "PPCP", // PayPal Complete Payments (includes Express Checkout, ACDC, Apple Pay, Google Pay)
  "EXPRESS_CHECKOUT",
  "PAYMENT_METHODS", // Alternative payment methods (Apple Pay, Google Pay)
  "ADVANCED_VAULTING", // Save payment methods
  "IDEAL",
  "MB_WAY",
  "MULTIBANCO",
  "PPPLUS",
  "PRZELEWY24",
  "SATISPAY",
  "TRUSTLY",
  "WECHAT_PAY",
  "WEBSITE_PAYMENT_PRO",
  "ZETTLE",
  "HYPERWALLET_PAYOUTS",
]);

export type PayPalProduct = z.infer<typeof PayPalProductSchema>;

// Capabilities that can be requested
export const PayPalCapabilitySchema = z.enum([
  "PAYPAL_WALLET_VAULTING_ADVANCED", // Save payment methods
  "PAY_UPON_INVOICE", // Deferred payment
  "APPLE_PAY",
  "GOOGLE_PAY",
]);

export type PayPalCapability = z.infer<typeof PayPalCapabilitySchema>;

// Legal consent types
export const LegalConsentTypeSchema = z.enum([
  "SHARE_DATA_CONSENT", // Required to store customer data
]);

export type LegalConsentType = z.infer<typeof LegalConsentTypeSchema>;

// Operation types
export const OperationTypeSchema = z.enum([
  "API_INTEGRATION", // Standard API integration
]);

export type OperationType = z.infer<typeof OperationTypeSchema>;

// API Integration Preference
export const ApiIntegrationPreferenceSchema = z.enum([
  "PAYPAL", // Onboard with PayPal
  "THIRD_PARTY", // Onboard via third party
]);

export type ApiIntegrationPreference = z.infer<typeof ApiIntegrationPreferenceSchema>;

/**
 * Business entity details
 */
export interface BusinessEntity {
  business_type?: {
    type?: "INDIVIDUAL" | "PROPRIETORSHIP" | "PARTNERSHIP" | "CORPORATION" | "NONPROFIT" | "GOVERNMENT";
    subtype?: string;
  };
  names?: Array<{
    type: "LEGAL" | "DOING_BUSINESS_AS";
    name: string;
  }>;
  emails?: Array<{
    type?: "CUSTOMER_SERVICE";
    email: string;
  }>;
  website?: string;
  addresses?: Array<{
    type: "WORK" | "HOME";
    address_line_1?: string;
    address_line_2?: string;
    admin_area_2?: string; // City
    admin_area_1?: string; // State/Province
    postal_code?: string;
    country_code: string; // ISO 3166-1 alpha-2
  }>;
  phones?: Array<{
    type: "MOBILE" | "HOME" | "WORK" | "FAX" | "PAGER" | "OTHER";
    country_code: string;
    national_number: string;
  }>;
}

/**
 * Individual owner details
 */
export interface IndividualOwner {
  names?: Array<{
    type: "LEGAL";
    given_name: string;
    surname: string;
  }>;
  citizenship?: string; // ISO 3166-1 alpha-2
  addresses?: Array<{
    type: "HOME";
    address_line_1?: string;
    address_line_2?: string;
    admin_area_2?: string; // City
    admin_area_1?: string; // State/Province
    postal_code?: string;
    country_code: string;
  }>;
  phones?: Array<{
    type: "MOBILE" | "HOME";
    country_code: string;
    national_number: string;
  }>;
  birth_details?: {
    date_of_birth: string; // YYYY-MM-DD
  };
  identification_documents?: Array<{
    type: "NATIONAL_ID" | "TAX_ID" | "PASSPORT";
    value: string;
    partial_value?: boolean;
    issuer_country_code?: string;
  }>;
  primary?: boolean; // Primary account owner
}

/**
 * Legal consent
 */
export interface LegalConsent {
  type: LegalConsentType;
  granted: boolean;
}

/**
 * API Integration operation
 */
export interface ApiIntegrationOperation {
  operation: OperationType;
  api_integration_preference: {
    rest_api_integration: {
      integration_method: "PAYPAL";
      integration_type: "THIRD_PARTY";
      third_party_details: {
        features: string[]; // e.g., ["PAYMENT", "REFUND", "PARTNER_FEE"]
      };
    };
  };
}

/**
 * Partner config override
 */
export interface PartnerConfigOverride {
  partner_logo_url?: string;
  return_url?: string;
  return_url_description?: string;
  action_renewal_url?: string;
  show_add_credit_card?: boolean;
}

/**
 * Create Partner Referral Request
 */
export interface CreatePartnerReferralRequest {
  tracking_id: string; // Unique identifier for this seller in partner's system
  operations: ApiIntegrationOperation[];
  products?: PayPalProduct[];
  capabilities?: PayPalCapability[];
  legal_consents: LegalConsent[];

  // Optional seller information (prefill)
  email?: string;
  preferred_language_code?: string; // e.g., "en-US"
  business_entity?: BusinessEntity;
  individual_owners?: IndividualOwner[]; // Max 2 owners
  partner_config_override?: PartnerConfigOverride;
  legal_country_code?: string; // ISO 3166-1 alpha-2
}

/**
 * Hypermedia Link (HATEOAS)
 */
export interface HateoasLink {
  href: string;
  rel: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  description?: string;
}

/**
 * Create Partner Referral Response
 */
export interface CreatePartnerReferralResponse {
  links: HateoasLink[];
  partner_referral_id?: PayPalPartnerReferralId;
}

/**
 * Seller Status - Product
 */
export interface SellerProduct {
  name: string;
  vetting_status?: "SUBSCRIBED" | "PENDING" | "DENIED" | "NEED_MORE_DATA";
  active?: boolean;
}

/**
 * Seller Status - Capability
 */
export interface SellerCapability {
  name: string;
  status?: "ACTIVE" | "INACTIVE" | "PENDING";
  limits?: Array<{
    type: string;
    value?: {
      amount?: {
        currency_code: string;
        value: string;
      };
    };
  }>;
  scopes?: string[]; // OAuth scopes
}

/**
 * Show Seller Status Response
 */
export interface ShowSellerStatusResponse {
  merchant_id: string;
  tracking_id?: string;
  legal_country_code?: string;

  products?: SellerProduct[];
  capabilities?: SellerCapability[];

  // Account status flags (PayPal returns these in snake_case)
  primary_email_confirmed?: boolean;
  payments_receivable?: boolean;

  // OAuth integrations
  oauth_integrations?: Array<{
    integration_type?: string;
    integration_method?: string;
    oauth_third_party?: Array<{
      partner_client_id?: string;
      merchant_client_id?: string;
      scopes?: string[];
    }>;
  }>;

  // Account restrictions
  account_status?: "ACTIVE" | "SUSPENDED" | "CLOSED";
}

/**
 * Payment Method Readiness Result
 */
export interface PaymentMethodReadiness {
  paypalButtons: boolean;
  advancedCardProcessing: boolean;
  applePay: boolean;
  googlePay: boolean;
  vaulting: boolean;
  primaryEmailConfirmed: boolean;
  paymentsReceivable: boolean;
  oauthIntegrated: boolean;
}

/**
 * Apple Pay Domain Registration Types (Wallet Domains API)
 * https://developer.paypal.com/docs/multiparty/checkout/apm/apple-pay/#set-up-your-testing-environment
 * API Endpoint: POST /v1/customer/wallet-domains
 */

/**
 * Register Apple Pay Domain Request
 * Uses the wallet-domains API format
 */
export interface RegisterApplePayDomainRequest {
  provider_type: "APPLE_PAY"; // Required: Provider type
  domain: {
    name: string; // e.g., "example.com"
  };
}

/**
 * Register Apple Pay Domain Response
 * Returns 201 CREATED on success
 */
export interface RegisterApplePayDomainResponse {
  provider_type: "APPLE_PAY";
  domain: {
    name: string;
  };
  status?: "VERIFIED" | "PENDING" | "DENIED";
  links?: HateoasLink[];
}

/**
 * Get Apple Pay Domains Response
 * GET /v1/customer/wallet-domains
 */
export interface GetApplePayDomainsResponse {
  domains?: Array<{
    provider_type: "APPLE_PAY";
    domain: {
      name: string;
    };
    status?: "VERIFIED" | "PENDING" | "DENIED";
    created_at?: string;
    updated_at?: string;
  }>;
  links?: HateoasLink[];
}

/**
 * Delete Apple Pay Domain Response
 * POST /v1/customer/unregister-wallet-domain
 */
export interface DeleteApplePayDomainResponse {
  success: boolean;
}
