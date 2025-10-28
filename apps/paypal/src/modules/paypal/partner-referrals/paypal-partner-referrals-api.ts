import { Result, err, ok } from "neverthrow";
import { PayPalClient } from "../paypal-client";
import { PayPalApiError } from "../paypal-api-error";
import { PayPalMerchantId } from "../paypal-merchant-id";
import { PayPalPartnerReferralId, createPayPalPartnerReferralId } from "../paypal-partner-referral-id";
import {
  CreatePartnerReferralRequest,
  CreatePartnerReferralResponse,
  ShowSellerStatusResponse,
  PaymentMethodReadiness,
} from "./types";

/**
 * PayPal Partner Referrals API Interface
 * Handles merchant onboarding and seller status management
 */
export interface IPayPalPartnerReferralsApi {
  /**
   * Creates a partner referral for merchant onboarding
   * Returns an action URL where the seller should be redirected to complete onboarding
   */
  createPartnerReferral(
    request: CreatePartnerReferralRequest
  ): Promise<Result<CreatePartnerReferralResponse, PayPalApiError>>;

  /**
   * Gets the current status of a seller account
   * Used to verify account readiness and payment method capabilities
   */
  getSellerStatus(
    merchantId: PayPalMerchantId
  ): Promise<Result<ShowSellerStatusResponse, PayPalApiError>>;

  /**
   * Checks payment method readiness for a seller
   * Returns which payment methods the seller is approved for
   */
  checkPaymentMethodReadiness(
    merchantId: PayPalMerchantId
  ): Promise<Result<PaymentMethodReadiness, PayPalApiError>>;
}

/**
 * PayPal Partner Referrals API Implementation
 */
export class PayPalPartnerReferralsApi implements IPayPalPartnerReferralsApi {
  private client: PayPalClient;

  constructor(client: PayPalClient) {
    this.client = client;
  }

  static create(client: PayPalClient): PayPalPartnerReferralsApi {
    return new PayPalPartnerReferralsApi(client);
  }

  /**
   * Create Partner Referral
   * POST /v2/customer/partner-referrals
   */
  async createPartnerReferral(
    request: CreatePartnerReferralRequest
  ): Promise<Result<CreatePartnerReferralResponse, PayPalApiError>> {
    try {
      const response = await this.client.makeRequest<CreatePartnerReferralResponse>({
        method: "POST",
        path: "/v2/customer/partner-referrals",
        body: request,
      });

      // Extract partner_referral_id from the links if not directly provided
      const selfLink = response.links.find((link) => link.rel === "self");
      if (selfLink && !response.partner_referral_id) {
        // Extract ID from self link URL
        const match = selfLink.href.match(/partner-referrals\/([^/?]+)/);
        if (match && match[1]) {
          response.partner_referral_id = createPayPalPartnerReferralId(match[1]);
        }
      }

      return ok(response);
    } catch (error) {
      return err(
        new PayPalApiError((error as any).message || "Failed to create partner referral", {
          statusCode: (error as any).statusCode || 500,
          paypalErrorName: (error as any).name || "CreatePartnerReferralError",
          paypalErrorMessage: (error as any).message || "Failed to create partner referral",
          cause: error,
        })
      );
    }
  }

  /**
   * Show Seller Status
   * GET /v1/customer/partners/{partner_merchant_id}/merchant-integrations/{merchant_id}
   */
  async getSellerStatus(
    merchantId: PayPalMerchantId
  ): Promise<Result<ShowSellerStatusResponse, PayPalApiError>> {
    try {
      // Note: Partner merchant ID should come from the client credentials
      // For now, we'll use the merchant_id in the path as documented
      const response = await this.client.makeRequest<ShowSellerStatusResponse>({
        method: "GET",
        path: `/v1/customer/partners/merchant-integrations/${merchantId}`,
      });

      return ok(response);
    } catch (error) {
      return err(
        new PayPalApiError((error as any).message || "Failed to get seller status", {
          statusCode: (error as any).statusCode || 500,
          paypalErrorName: (error as any).name || "GetSellerStatusError",
          paypalErrorMessage: (error as any).message || "Failed to get seller status",
          cause: error,
        })
      );
    }
  }

  /**
   * Check Payment Method Readiness
   * Analyzes seller status response to determine which payment methods are available
   */
  async checkPaymentMethodReadiness(
    merchantId: PayPalMerchantId
  ): Promise<Result<PaymentMethodReadiness, PayPalApiError>> {
    const statusResult = await this.getSellerStatus(merchantId);

    return statusResult.andThen((status) => {
      const readiness: PaymentMethodReadiness = {
        paypalButtons: false,
        advancedCardProcessing: false,
        applePay: false,
        googlePay: false,
        vaulting: false,
        primaryEmailConfirmed: status.PRIMARY_EMAIL_CONFIRMED ?? false,
        paymentsReceivable: status.PAYMENTS_RECEIVABLE ?? false,
        oauthIntegrated: (status.oauth_integrations?.length ?? 0) > 0,
      };

      // Check products
      const products = status.products || [];
      const ppcpCustom = products.find((p) => p.name === "PPCP_CUSTOM");
      const paymentMethods = products.find((p) => p.name === "PAYMENT_METHODS");
      const advancedVaulting = products.find((p) => p.name === "ADVANCED_VAULTING");

      // PayPal Buttons: Available if PPCP_CUSTOM is subscribed
      if (ppcpCustom?.vetting_status === "SUBSCRIBED") {
        readiness.paypalButtons = true;
      }

      // Advanced Card Processing: PPCP_CUSTOM subscribed + CUSTOM_CARD_PROCESSING active with no limits
      if (ppcpCustom?.vetting_status === "SUBSCRIBED") {
        const capabilities = status.capabilities || [];
        const cardProcessing = capabilities.find((c) => c.name === "CUSTOM_CARD_PROCESSING");

        if (cardProcessing?.status === "ACTIVE" && !cardProcessing.limits?.length) {
          readiness.advancedCardProcessing = true;
        }
      }

      // Apple Pay: PPCP_CUSTOM + PAYMENT_METHODS subscribed + APPLE_PAY capability active
      if (
        ppcpCustom?.vetting_status === "SUBSCRIBED" &&
        paymentMethods?.vetting_status === "SUBSCRIBED"
      ) {
        const capabilities = status.capabilities || [];
        const applePay = capabilities.find((c) => c.name === "APPLE_PAY");

        if (applePay?.status === "ACTIVE") {
          readiness.applePay = true;
        }
      }

      // Google Pay: PPCP_CUSTOM + PAYMENT_METHODS subscribed + GOOGLE_PAY capability active
      if (
        ppcpCustom?.vetting_status === "SUBSCRIBED" &&
        paymentMethods?.vetting_status === "SUBSCRIBED"
      ) {
        const capabilities = status.capabilities || [];
        const googlePay = capabilities.find((c) => c.name === "GOOGLE_PAY");

        if (googlePay?.status === "ACTIVE") {
          readiness.googlePay = true;
        }
      }

      // Vaulting: ADVANCED_VAULTING subscribed + PAYPAL_WALLET_VAULTING_ADVANCED capability active
      if (advancedVaulting?.vetting_status === "SUBSCRIBED") {
        const capabilities = status.capabilities || [];
        const vaultingCapability = capabilities.find(
          (c) => c.name === "PAYPAL_WALLET_VAULTING_ADVANCED"
        );

        if (vaultingCapability?.status === "ACTIVE") {
          // Also check for required scopes
          const hasRequiredScopes =
            vaultingCapability.scopes?.includes(
              "https://uri.paypal.com/services/billing-agreements"
            ) &&
            vaultingCapability.scopes?.includes(
              "https://uri.paypal.com/services/vault/payment-tokens/read"
            ) &&
            vaultingCapability.scopes?.includes(
              "https://uri.paypal.com/services/vault/payment-tokens/readwrite"
            );

          if (hasRequiredScopes) {
            readiness.vaulting = true;
          }
        }
      }

      return ok(readiness);
    });
  }
}
