import { captureException } from "@sentry/nextjs";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";
import { PayPalPartnerReferralsApiFactory } from "@/modules/paypal/partner-referrals/paypal-partner-referrals-api-factory";
import { createPayPalMerchantId } from "@/modules/paypal/paypal-merchant-id";
import { createLogger } from "@/lib/logger";
import { getPool } from "@/lib/database";
import { PostgresMerchantOnboardingRepository } from "../merchant-onboarding-repository";
import { createSaleorApiUrl } from "@/modules/saleor/saleor-api-url";

const logger = createLogger("RegisterApplePayDomainHandler");

/**
 * tRPC Handler for registering an Apple Pay domain for a merchant
 * POST /v1/vault/apple-pay/domains
 */
export class RegisterApplePayDomainHandler {
  baseProcedure = protectedClientProcedure;

  getTrpcProcedure() {
    return this.baseProcedure
      .input(
        z.object({
          trackingId: z.string().min(1, "Tracking ID is required"),
          domainName: z
            .string()
            .min(1, "Domain name is required")
            .regex(
              /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?)*$/,
              "Invalid domain name format"
            ),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.saleorApiUrl) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Missing saleorApiUrl in request",
          });
        }

        const saleorApiUrl = createSaleorApiUrl(ctx.saleorApiUrl);
        if (saleorApiUrl.isErr()) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Malformed saleorApiUrl",
          });
        }

        try {
          logger.info("Registering Apple Pay domain", {
            tracking_id: input.trackingId,
            domain_name: input.domainName,
          });

          // Get merchant record to retrieve merchant ID
          const pool = getPool();
          const repository = PostgresMerchantOnboardingRepository.create(pool);
          const merchantResult = await repository.getByTrackingId(
            saleorApiUrl.value,
            input.trackingId
          );

          if (merchantResult.isErr()) {
            captureException(merchantResult.error);
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to retrieve merchant information",
            });
          }

          if (!merchantResult.value) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Merchant not found. Please connect your PayPal account first.",
            });
          }

          const merchant = merchantResult.value;

          if (!merchant.paypalMerchantId) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message:
                "PayPal Merchant ID not available. Please complete the PayPal onboarding process.",
            });
          }

          // Get global WSM configuration
          const { GlobalPayPalConfigRepository } = await import(
            "@/modules/wsm-admin/global-paypal-config-repository"
          );
          const globalConfigRepo = GlobalPayPalConfigRepository.create(getPool());
          const globalConfigResult = await globalConfigRepo.getActiveConfig();

          if (globalConfigResult.isErr()) {
            captureException(globalConfigResult.error);
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to load PayPal configuration",
            });
          }

          if (!globalConfigResult.value) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message:
                "No PayPal configuration found. Please contact administrator to configure global PayPal settings.",
            });
          }

          const globalConfig = globalConfigResult.value;
          const merchantId = createPayPalMerchantId(merchant.paypalMerchantId);

          // Create Partner Referrals API client
          const apiFactory = PayPalPartnerReferralsApiFactory.create();
          const partnerApi = apiFactory.create({
            clientId: globalConfig.clientId,
            clientSecret: globalConfig.clientSecret,
            partnerMerchantId: globalConfig.partnerMerchantId,
            merchantId: merchantId, // Pass merchant ID for PayPal-Auth-Assertion header
            env: globalConfig.environment,
          });

          // Register the domain with wallet-domains API format
          const result = await partnerApi.registerApplePayDomain(merchantId, {
            provider_type: "APPLE_PAY",
            domain: {
              name: input.domainName,
            },
          });

          if (result.isErr()) {
            logger.error("Failed to register Apple Pay domain", {
              merchant_id: merchant.paypalMerchantId,
              domain_name: input.domainName,
              error: result.error.message,
              status_code: result.error.statusCode,
              debug_id: (result.error as any).details?.debug_id,
            });

            // Provide more helpful error message for common issues
            let errorMessage = result.error.paypalErrorMessage || "Failed to register Apple Pay domain";

            if (result.error.statusCode === 500) {
              errorMessage = `PayPal API Error: ${errorMessage}. Note: Apple Pay domain registration may have limited support in sandbox environment. Debug ID: ${(result.error as any).details?.debug_id || 'N/A'}. Please verify: 1) Merchant has APPLE_PAY capability active, 2) Domain is accessible via HTTPS, 3) Try in production environment if sandbox continues to fail.`;
            }

            throw new TRPCError({
              code: result.error.statusCode === 400 ? "BAD_REQUEST" : "INTERNAL_SERVER_ERROR",
              message: errorMessage,
            });
          }

          logger.info("Apple Pay domain registered successfully", {
            merchant_id: merchant.paypalMerchantId,
            domain_name: result.value.domain.name,
            status: result.value.status,
          });

          return {
            success: true,
            domain: {
              domainName: result.value.domain.name,
              status: result.value.status,
              createdAt: undefined, // Not returned by PayPal API on registration
              updatedAt: undefined, // Not returned by PayPal API on registration
            },
          };
        } catch (error) {
          if (error instanceof TRPCError) {
            throw error;
          }

          logger.error("Unexpected error registering Apple Pay domain", {
            tracking_id: input.trackingId,
            domain_name: input.domainName,
            error: error instanceof Error ? error.message : String(error),
          });

          captureException(error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "An unexpected error occurred while registering the domain",
          });
        }
      });
  }
}
