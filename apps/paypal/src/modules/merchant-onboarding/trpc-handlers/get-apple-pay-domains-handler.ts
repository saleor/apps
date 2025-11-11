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

const logger = createLogger("GetApplePayDomainsHandler");

/**
 * tRPC Handler for getting all registered Apple Pay domains for a merchant
 * GET /v1/vault/apple-pay/domains
 */
export class GetApplePayDomainsHandler {
  baseProcedure = protectedClientProcedure;

  getTrpcProcedure() {
    return this.baseProcedure
      .input(
        z.object({
          trackingId: z.string().min(1, "Tracking ID is required"),
        })
      )
      .query(async ({ input, ctx }) => {
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
          logger.info("Fetching Apple Pay domains", {
            tracking_id: input.trackingId,
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

          // Check if Apple Pay is enabled for this merchant
          if (!merchant.applePayEnabled) {
            logger.info("Apple Pay not enabled for merchant", {
              merchant_id: merchant.paypalMerchantId,
            });
            return {
              domains: [],
              applePayEnabled: false,
              message: "",
            };
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

          // Get all registered domains
          const result = await partnerApi.getApplePayDomains(merchantId);

          if (result.isErr()) {
            logger.error("Failed to get Apple Pay domains", {
              merchant_id: merchant.paypalMerchantId,
              error: result.error.message,
              status_code: result.error.statusCode,
              debug_id: (result.error as any).details?.debug_id,
            });

            const errorMessage = result.error.paypalErrorMessage || "Failed to retrieve Apple Pay domains";
            const debugId = (result.error as any).details?.debug_id;

            throw new TRPCError({
              code: result.error.statusCode === 404 ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
              message: debugId ? `${errorMessage} (Debug ID: ${debugId})` : errorMessage,
            });
          }

          logger.info("Apple Pay domains retrieved successfully", {
            merchant_id: merchant.paypalMerchantId,
            domains_count: result.value.domains?.length || 0,
          });

          return {
            applePayEnabled: true,
            domains:
              result.value.domains?.map((domain) => ({
                domainName: domain.domain.name,
                status: domain.status,
                createdAt: domain.created_at,
                updatedAt: domain.updated_at,
              })) || [],
            message: "",
          };
        } catch (error) {
          if (error instanceof TRPCError) {
            throw error;
          }

          logger.error("Unexpected error getting Apple Pay domains", {
            tracking_id: input.trackingId,
            error: error instanceof Error ? error.message : String(error),
          });

          captureException(error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "An unexpected error occurred while retrieving domains",
          });
        }
      });
  }
}
