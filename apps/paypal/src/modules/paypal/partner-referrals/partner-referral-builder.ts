import {
  CreatePartnerReferralRequest,
  PayPalProduct,
  PayPalCapability,
  BusinessEntity,
  IndividualOwner,
  PartnerConfigOverride,
} from "./types";

/**
 * Builder for creating Partner Referral requests with recommended defaults
 * Implements best practices from PayPal integration guide
 */
export class PartnerReferralBuilder {
  private request: Partial<CreatePartnerReferralRequest> = {
    operations: [
      {
        operation: "API_INTEGRATION",
        api_integration_preference: {
          rest_api_integration: {
            integration_method: "PAYPAL",
            integration_type: "THIRD_PARTY",
            third_party_details: {
              features: ["PAYMENT", "REFUND"], // Standard features
            },
          },
        },
      },
    ],
    legal_consents: [
      {
        type: "SHARE_DATA_CONSENT",
        granted: true, // Required to store customer data
      },
    ],
  };

  /**
   * Set the tracking ID (required)
   * Must be unique for each seller in the partner's system
   */
  withTrackingId(trackingId: string): this {
    this.request.tracking_id = trackingId;
    return this;
  }

  /**
   * Set seller email address
   * Recommended: Prefills the email during onboarding
   */
  withEmail(email: string): this {
    this.request.email = email;
    return this;
  }

  /**
   * Set preferred language code
   * Example: "en-US", "es-ES", "de-DE"
   */
  withLanguage(languageCode: string): this {
    this.request.preferred_language_code = languageCode;
    return this;
  }

  /**
   * Set legal country code (ISO 3166-1 alpha-2)
   * Example: "US", "GB", "DE"
   */
  withCountry(countryCode: string): this {
    this.request.legal_country_code = countryCode;
    return this;
  }

  /**
   * Add PayPal Complete Payments product
   * Includes Express Checkout, ACDC, Apple Pay, Google Pay
   */
  withPPCP(): this {
    if (!this.request.products) {
      this.request.products = [];
    }
    if (!this.request.products.includes("PPCP")) {
      this.request.products.push("PPCP");
    }
    return this;
  }

  /**
   * Add payment methods (Apple Pay, Google Pay)
   */
  withPaymentMethods(): this {
    if (!this.request.products) {
      this.request.products = [];
    }
    if (!this.request.products.includes("PAYMENT_METHODS")) {
      this.request.products.push("PAYMENT_METHODS");
    }
    return this;
  }

  /**
   * Add advanced vaulting (save payment methods)
   * Must be requested along with EXPRESS_CHECKOUT or PPCP
   */
  withAdvancedVaulting(): this {
    if (!this.request.products) {
      this.request.products = [];
    }
    if (!this.request.products.includes("ADVANCED_VAULTING")) {
      this.request.products.push("ADVANCED_VAULTING");
    }

    // Also add vaulting capability
    if (!this.request.capabilities) {
      this.request.capabilities = [];
    }
    if (!this.request.capabilities.includes("PAYPAL_WALLET_VAULTING_ADVANCED")) {
      this.request.capabilities.push("PAYPAL_WALLET_VAULTING_ADVANCED");
    }

    return this;
  }

  /**
   * Add Apple Pay capability
   * Requires PAYMENT_METHODS product
   */
  withApplePay(): this {
    this.withPaymentMethods();

    if (!this.request.capabilities) {
      this.request.capabilities = [];
    }
    if (!this.request.capabilities.includes("APPLE_PAY")) {
      this.request.capabilities.push("APPLE_PAY");
    }
    return this;
  }

  /**
   * Add Google Pay capability
   * Requires PAYMENT_METHODS product
   */
  withGooglePay(): this {
    this.withPaymentMethods();

    if (!this.request.capabilities) {
      this.request.capabilities = [];
    }
    if (!this.request.capabilities.includes("GOOGLE_PAY")) {
      this.request.capabilities.push("GOOGLE_PAY");
    }
    return this;
  }

  /**
   * Add custom product
   */
  withProduct(product: PayPalProduct): this {
    if (!this.request.products) {
      this.request.products = [];
    }
    if (!this.request.products.includes(product)) {
      this.request.products.push(product);
    }
    return this;
  }

  /**
   * Add custom capability
   */
  withCapability(capability: PayPalCapability): this {
    if (!this.request.capabilities) {
      this.request.capabilities = [];
    }
    if (!this.request.capabilities.includes(capability)) {
      this.request.capabilities.push(capability);
    }
    return this;
  }

  /**
   * Set business entity information
   * Recommended: Prefills business details during onboarding
   */
  withBusinessEntity(entity: BusinessEntity): this {
    this.request.business_entity = entity;
    return this;
  }

  /**
   * Set individual owners
   * Maximum 2 owners, one must be primary
   */
  withIndividualOwners(owners: IndividualOwner[]): this {
    if (owners.length > 2) {
      throw new Error("Maximum 2 individual owners allowed");
    }

    const primaryCount = owners.filter((o) => o.primary).length;
    if (primaryCount !== 1) {
      throw new Error("Exactly one owner must be marked as primary");
    }

    this.request.individual_owners = owners;
    return this;
  }

  /**
   * Set partner configuration override
   * Customize the onboarding experience
   */
  withPartnerConfig(config: PartnerConfigOverride): this {
    this.request.partner_config_override = config;
    return this;
  }

  /**
   * Set return URL where seller is redirected after onboarding
   */
  withReturnUrl(returnUrl: string, description?: string): this {
    if (!this.request.partner_config_override) {
      this.request.partner_config_override = {};
    }
    this.request.partner_config_override.return_url = returnUrl;
    if (description) {
      this.request.partner_config_override.return_url_description = description;
    }
    return this;
  }

  /**
   * Set partner logo URL for branding
   */
  withLogoUrl(logoUrl: string): this {
    if (!this.request.partner_config_override) {
      this.request.partner_config_override = {};
    }
    this.request.partner_config_override.partner_logo_url = logoUrl;
    return this;
  }

  /**
   * Build the complete request
   * Validates required fields
   */
  build(): CreatePartnerReferralRequest {
    if (!this.request.tracking_id) {
      throw new Error("tracking_id is required");
    }

    if (!this.request.operations) {
      throw new Error("operations is required");
    }

    if (!this.request.legal_consents) {
      throw new Error("legal_consents is required");
    }

    return this.request as CreatePartnerReferralRequest;
  }

  /**
   * Create a builder with recommended defaults for Web Shop Manager
   * Includes PPCP, Payment Methods, Apple Pay, Google Pay, and Advanced Vaulting
   */
  static createDefault(): PartnerReferralBuilder {
    return new PartnerReferralBuilder()
      .withPPCP()
      .withPaymentMethods()
      .withApplePay()
      .withGooglePay()
      .withAdvancedVaulting();
  }
}
