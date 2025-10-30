import { captureException } from "@sentry/nextjs";
import { TRPCError } from "@trpc/server";
import { getPool } from "@/lib/database";
import { createSaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";
import { PayPalPartnerReferralsApiFactory } from "@/modules/paypal/partner-referrals/paypal-partner-referrals-api-factory";
import { PartnerReferralBuilder } from "@/modules/paypal/partner-referrals/partner-referral-builder";
import { PostgresMerchantOnboardingRepository } from "../merchant-onboarding-repository";
import { createMerchantReferralInputSchema } from "./create-merchant-referral-input-schema";

/**
 * tRPC Handler for creating a merchant referral (onboarding link)
 * Implements the Partner Referrals V2 API integration
 */
export class CreateMerchantReferralTrpcHandler {
  baseProcedure = protectedClientProcedure;

  getTrpcProcedure() {
    return this.baseProcedure.input(createMerchantReferralInputSchema).mutation(async ({ input, ctx }) => {
      // Validate context
      if (!ctx.saleorApiUrl) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Missing saleorApiUrl in request",
        });
      }

      if (!ctx.appToken) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Missing app authentication token",
        });
      }

      if (!ctx.appId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Missing appId in request",
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
        // Get global WSM configuration
        const { GlobalPayPalConfigRepository } = await import("@/modules/wsm-admin/global-paypal-config-repository");
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
            message: "No PayPal configuration found. Please contact administrator to configure global PayPal settings.",
          });
        }

        const globalConfig = globalConfigResult.value;
        const paypalConfig = {
          clientId: globalConfig.clientId,
          clientSecret: globalConfig.clientSecret,
          environment: globalConfig.environment,
        };
        const partnerMerchantId = globalConfig.partnerMerchantId;

        // Create Partner Referrals API client
        const apiFactory = PayPalPartnerReferralsApiFactory.create();
        const referralsApi = apiFactory.create({
          clientId: paypalConfig.clientId,
          clientSecret: paypalConfig.clientSecret,
          partnerMerchantId: partnerMerchantId,
          env: paypalConfig.environment,
        });

        // Build partner referral request
        const builder = PartnerReferralBuilder.createDefault()
          .withTrackingId(input.trackingId)
          .withEmail(input.merchantEmail)
          .withReturnUrl(input.returnUrl, input.returnUrlDescription);

        // Add optional fields
        if (input.merchantCountry) {
          builder.withCountry(input.merchantCountry);
        }

        if (input.preferredLanguage) {
          builder.withLanguage(input.preferredLanguage);
        }

        if (input.logoUrl) {
          builder.withLogoUrl(input.logoUrl);
        }

        // Configure payment methods based on input
        if (!input.enablePPCP) {
          // If PPCP not enabled, we need to reconfigure
          // For now, PPCP is required, so throw error
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "PPCP (PayPal Complete Payments) is required",
          });
        }

        // Business entity (if provided)
        if (input.businessName) {
          builder.withBusinessEntity({
            names: [
              {
                type: "LEGAL",
                name: input.businessName,
              },
            ],
            business_type: input.businessType
              ? {
                  type: input.businessType,
                }
              : undefined,
            website: input.businessWebsite,
          });
        }

        const referralRequest = builder.build();

        // Create partner referral via API
        const referralResult = await referralsApi.createPartnerReferral(referralRequest);

        if (referralResult.isErr()) {
          captureException(referralResult.error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to create partner referral: ${referralResult.error.message}`,
          });
        }

        const referralResponse = referralResult.value;

        // Extract action URL from HATEOAS links
        const actionLink = referralResponse.links.find((link) => link.rel === "action_url");
        if (!actionLink) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "No action URL returned from PayPal",
          });
        }

        // Store onboarding record in database
        const pool = getPool();
        const repository = PostgresMerchantOnboardingRepository.create(pool);

        const createResult = await repository.create({
          saleorApiUrl: saleorApiUrl.value,
          trackingId: input.trackingId,
          merchantEmail: input.merchantEmail,
          merchantCountry: input.merchantCountry,
          partnerReferralId: referralResponse.partner_referral_id,
          actionUrl: actionLink.href,
          returnUrl: input.returnUrl,
        });

        if (createResult.isErr()) {
          captureException(createResult.error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to save onboarding record: ${createResult.error.message}`,
          });
        }

        return {
          success: true,
          actionUrl: actionLink.href,
          partnerReferralId: referralResponse.partner_referral_id,
          trackingId: input.trackingId,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        captureException(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred",
        });
      }
    });
  }
}
