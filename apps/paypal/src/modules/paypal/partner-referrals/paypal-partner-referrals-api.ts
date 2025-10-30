import { Result, err, ok } from "neverthrow";
import { PayPalClient } from "../paypal-client";
import { PayPalApiError } from "../paypal-api-error";
import { PayPalMerchantId } from "../paypal-merchant-id";
import { PayPalPartnerReferralId, createPayPalPartnerReferralId } from "../paypal-partner-referral-id";
import { createLogger } from "@/lib/logger";
import {
  CreatePartnerReferralRequest,
  CreatePartnerReferralResponse,
  ShowSellerStatusResponse,
  PaymentMethodReadiness,
} from "./types";

const logger = createLogger("PayPalPartnerReferralsApi");

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
   * Gets the current status of a seller account by merchant ID
   * Used to verify account readiness and payment method capabilities
   */
  getSellerStatus(
    merchantId: PayPalMerchantId
  ): Promise<Result<ShowSellerStatusResponse, PayPalApiError>>;

  /**
   * Gets the current status of a seller account by tracking ID
   * Use this when you have the tracking ID but not the merchant ID yet
   */
  getSellerStatusByTrackingId(
    trackingId: string
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
      logger.info("Creating partner referral", {
        tracking_id: request.tracking_id,
        email: request.email,
        country: request.legal_country_code,
        products: request.products,
        capabilities: request.capabilities,
      });

      logger.debug("Partner referral request payload", {
        request: JSON.stringify(request, null, 2),
      });

      const response = await this.client.makeRequest<CreatePartnerReferralResponse>({
        method: "POST",
        path: "/v2/customer/partner-referrals",
        body: request,
      });

      logger.info("Partner referral created successfully", {
        partner_referral_id: response.partner_referral_id,
        tracking_id: request.tracking_id,
        action_url: response.links.find((link) => link.rel === "action_url")?.href,
      });

      logger.debug("Partner referral response", {
        response: JSON.stringify(response, null, 2),
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
      logger.error("Failed to create partner referral", {
        tracking_id: request.tracking_id,
        error: error instanceof Error ? error.message : String(error),
        statusCode: (error as any).statusCode,
        paypalError: (error as any).name,
        details: JSON.stringify((error as any).details || {}, null, 2),
      });

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
      const partnerMerchantId = this.client.getPartnerMerchantId();

      if (!partnerMerchantId) {
        logger.error("Partner merchant ID not configured", {
          merchant_id: merchantId,
        });
        return err(
          new PayPalApiError("Partner merchant ID not configured in global settings", {
            statusCode: 400,
            paypalErrorName: "MissingPartnerMerchantId",
            paypalErrorMessage: "Partner merchant ID must be configured in WSM admin settings",
          })
        );
      }

      logger.info("Fetching seller status", {
        merchant_id: merchantId,
        partner_merchant_id: partnerMerchantId,
      });

      const response = await this.client.makeRequest<ShowSellerStatusResponse>({
        method: "GET",
        path: `/v1/customer/partners/${partnerMerchantId}/merchant-integrations/${merchantId}`,
      });

      logger.info("Seller status retrieved successfully", {
        merchant_id: merchantId,
        payments_receivable: response.payments_receivable,
        primary_email_confirmed: response.primary_email_confirmed,
        products_count: response.products?.length || 0,
        capabilities_count: response.capabilities?.length || 0,
      });

      logger.debug("Seller status response", {
        response: JSON.stringify(response, null, 2),
      });

      return ok(response);
    } catch (error) {
      logger.error("Failed to get seller status", {
        merchant_id: merchantId,
        error: error instanceof Error ? error.message : String(error),
        statusCode: (error as any).statusCode,
        paypalError: (error as any).name,
        details: JSON.stringify((error as any).details || {}, null, 2),
      });

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
   * Show Seller Status by Tracking ID
   * GET /v1/customer/partners/{partner_merchant_id}/merchant-integrations?tracking_id={tracking_id}
   * Use this when you don't have the merchant ID yet (before onboarding completion)
   */
  async getSellerStatusByTrackingId(
    trackingId: string
  ): Promise<Result<ShowSellerStatusResponse, PayPalApiError>> {
    try {
      const partnerMerchantId = this.client.getPartnerMerchantId();

      if (!partnerMerchantId) {
        logger.error("Partner merchant ID not configured", {
          tracking_id: trackingId,
        });
        return err(
          new PayPalApiError("Partner merchant ID not configured in global settings", {
            statusCode: 400,
            paypalErrorName: "MissingPartnerMerchantId",
            paypalErrorMessage: "Partner merchant ID must be configured in WSM admin settings",
          })
        );
      }

      logger.info("Fetching seller status by tracking ID", {
        tracking_id: trackingId,
        partner_merchant_id: partnerMerchantId,
      });

      const response = await this.client.makeRequest<ShowSellerStatusResponse>({
        method: "GET",
        path: `/v1/customer/partners/${partnerMerchantId}/merchant-integrations?tracking_id=${encodeURIComponent(trackingId)}`,
      });

      logger.info("Seller status by tracking ID retrieved successfully", {
        tracking_id: trackingId,
        merchant_id: response.merchant_id,
        payments_receivable: response.payments_receivable,
        primary_email_confirmed: response.primary_email_confirmed,
      });

      logger.debug("Seller status response", {
        response: JSON.stringify(response, null, 2),
      });

      return ok(response);
    } catch (error) {
      logger.error("Failed to get seller status by tracking ID", {
        tracking_id: trackingId,
        error: error instanceof Error ? error.message : String(error),
        statusCode: (error as any).statusCode,
        paypalError: (error as any).name,
        details: JSON.stringify((error as any).details || {}, null, 2),
      });

      return err(
        new PayPalApiError((error as any).message || "Failed to get seller status by tracking ID", {
          statusCode: (error as any).statusCode || 500,
          paypalErrorName: (error as any).name || "GetSellerStatusByTrackingIdError",
          paypalErrorMessage: (error as any).message || "Failed to get seller status by tracking ID",
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
        primaryEmailConfirmed: status.primary_email_confirmed ?? false,
        paymentsReceivable: status.payments_receivable ?? false,
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

      logger.info("Payment method readiness calculated", {
        merchant_id: merchantId,
        paypal_buttons: readiness.paypalButtons,
        card_processing: readiness.advancedCardProcessing,
        apple_pay: readiness.applePay,
        google_pay: readiness.googlePay,
        vaulting: readiness.vaulting,
        email_confirmed: readiness.primaryEmailConfirmed,
        payments_receivable: readiness.paymentsReceivable,
        oauth_integrated: readiness.oauthIntegrated,
      });

      logger.debug("Payment method readiness details", {
        readiness: JSON.stringify(readiness, null, 2),
      });

      return ok(readiness);
    });
  }
}
