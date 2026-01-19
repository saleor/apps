import { captureException } from "@sentry/nextjs";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getPool } from "@/lib/database";
import { createSaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";
import { PayPalPartnerReferralsApiFactory } from "@/modules/paypal/partner-referrals/paypal-partner-referrals-api-factory";
import { createPayPalMerchantId } from "@/modules/paypal/paypal-merchant-id";
import { PostgresMerchantOnboardingRepository } from "../merchant-onboarding-repository";
import { GlobalPayPalConfigRepository } from "@/modules/wsm-admin/global-paypal-config-repository";
import { PayPalMultiConfigMetadataManager } from "@/modules/paypal/configuration/paypal-multi-config-metadata-manager";
import { PayPalConfig } from "@/modules/app-config/domain/paypal-config";
import { createSettingsManager } from "@/lib/metadata-manager";
import { createGraphQLClient } from "@saleor/apps-shared/create-graphql-client";

/**
 * tRPC Handler for refreshing merchant status from PayPal
 * Checks seller status and updates payment method readiness
 */
export class RefreshMerchantStatusTrpcHandler {
  baseProcedure = protectedClientProcedure;

  getTrpcProcedure() {
    return this.baseProcedure
      .input(
        z.object({
          trackingId: z.string().min(1),
        })
      )
      .mutation(async ({ input, ctx }) => {
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
          const pool = getPool();
          const repository = PostgresMerchantOnboardingRepository.create(pool);

          // Get existing onboarding record
          const recordResult = await repository.getByTrackingId(saleorApiUrl.value, input.trackingId);

          if (recordResult.isErr()) {
            captureException(recordResult.error);
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to retrieve merchant record",
            });
          }

          if (!recordResult.value) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Merchant onboarding not found",
            });
          }

          const record = recordResult.value;

          // Fetch PayPal configuration from the global repository
          const globalConfigRepository = GlobalPayPalConfigRepository.create(pool);
          const paypalConfigResult = await globalConfigRepository.getActiveConfig();

          if (paypalConfigResult.isErr()) {
            captureException(paypalConfigResult.error);
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to retrieve PayPal configuration",
            });
          }

          const paypalConfig = paypalConfigResult.value;

          if (!paypalConfig) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "No active PayPal configuration found",
            });
          }

          // Create Partner Referrals API client
          const apiFactory = PayPalPartnerReferralsApiFactory.create();
          const referralsApi = apiFactory.create({
            clientId: paypalConfig.clientId,
            clientSecret: paypalConfig.clientSecret,
            partnerMerchantId: paypalConfig.partnerMerchantId,
            env: paypalConfig.environment,
          });

          // Query seller status - use tracking_id if merchant hasn't completed onboarding yet
          let statusResult;
          if (!record.paypalMerchantId) {
            // Merchant hasn't completed onboarding - query by tracking_id
            statusResult = await referralsApi.getSellerStatusByTrackingId(input.trackingId);
          } else {
            // Merchant has completed onboarding - query by merchant_id
            const merchantId = createPayPalMerchantId(record.paypalMerchantId);
            statusResult = await referralsApi.getSellerStatus(merchantId);
          }

          if (statusResult.isErr()) {
            // Update with error
            await repository.update(saleorApiUrl.value, input.trackingId, {
              lastStatusCheck: new Date(),
              statusCheckError: statusResult.error.message,
            });

            captureException(statusResult.error);
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Failed to check seller status: ${statusResult.error.message}`,
            });
          }

          const status = statusResult.value;

          // Parse readiness from status
          const readiness = {
            paypalButtons: false,
            advancedCardProcessing: false,
            applePay: false,
            googlePay: false,
            vaulting: false,
            primaryEmailConfirmed: status.primary_email_confirmed ?? false,
            paymentsReceivable: status.payments_receivable ?? false,
            oauthIntegrated: (status.oauth_integrations?.length ?? 0) > 0,
          };

          // Check products for payment methods
          const products = status.products || [];
          const ppcpStandard = products.find((p) => p.name === "PPCP_STANDARD");
          const ppcpCustom = products.find((p) => p.name === "PPCP_CUSTOM");
          const advancedVaulting = products.find((p) => p.name === "ADVANCED_VAULTING");

          // Check if merchant has any PPCP subscription (STANDARD or CUSTOM)
          const hasPPCP =
            ppcpStandard?.vetting_status === "SUBSCRIBED" ||
            ppcpCustom?.vetting_status === "SUBSCRIBED";

          if (hasPPCP) {
            // PayPal Buttons are available with any PPCP subscription
            readiness.paypalButtons = true;

            const capabilities = status.capabilities || [];

            // Advanced Card Processing requires CUSTOM_CARD_PROCESSING capability
            const cardProcessing = capabilities.find((c) => c.name === "CUSTOM_CARD_PROCESSING");
            if (cardProcessing?.status === "ACTIVE" && !cardProcessing.limits?.length) {
              readiness.advancedCardProcessing = true;
            }

            // Apple Pay and Google Pay - check if capabilities are active
            // No longer requires PAYMENT_METHODS product, just checks capability status
            const applePay = capabilities.find((c) => c.name === "APPLE_PAY");
            if (applePay?.status === "ACTIVE") {
              readiness.applePay = true;
            }

            const googlePay = capabilities.find((c) => c.name === "GOOGLE_PAY");
            if (googlePay?.status === "ACTIVE") {
              readiness.googlePay = true;
            }
          }

          if (advancedVaulting?.vetting_status === "SUBSCRIBED") {
            const capabilities = status.capabilities || [];
            const vaultingCapability = capabilities.find(
              (c) => c.name === "PAYPAL_WALLET_VAULTING_ADVANCED"
            );

            if (vaultingCapability?.status === "ACTIVE") {
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

          // Update merchant ID if it's now available (merchant completed onboarding)
          if (!record.paypalMerchantId && status.merchant_id) {
            await repository.update(saleorApiUrl.value, input.trackingId, {
              paypalMerchantId: createPayPalMerchantId(status.merchant_id),
            });
          }

          // Store raw products and capabilities for debugging and auditing
          await repository.update(saleorApiUrl.value, input.trackingId, {
            subscribedProducts: status.products || [],
            activeCapabilities: status.capabilities || [],
          });

          // Update onboarding record with readiness info
          const updateResult = await repository.updatePaymentMethodReadiness(
            saleorApiUrl.value,
            input.trackingId,
            readiness
          );

          if (updateResult.isErr()) {
            captureException(updateResult.error);
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to update merchant status",
            });
          }

          // Determine onboarding status
          let onboardingStatus = record.onboardingStatus;
          if (readiness.primaryEmailConfirmed && readiness.paymentsReceivable && readiness.oauthIntegrated) {
            onboardingStatus = "COMPLETED";
          } else {
            onboardingStatus = "IN_PROGRESS";
          }

          // Update onboarding status if changed
          if (onboardingStatus !== record.onboardingStatus) {
            await repository.update(saleorApiUrl.value, input.trackingId, {
              onboardingStatus,
              onboardingCompletedAt: onboardingStatus === "COMPLETED" ? new Date() : undefined,
            });
          }

          // If onboarding is completed, extract OAuth credentials and save to metadata + database
          if (onboardingStatus === "COMPLETED" && status.oauth_integrations && status.oauth_integrations.length > 0) {
            try {
              const oauthIntegration = status.oauth_integrations[0];
              const oauthThirdParty = oauthIntegration.oauth_third_party?.[0];

              if (oauthThirdParty?.merchant_client_id && record.merchantEmail) {
                // Save to database first
                await repository.update(saleorApiUrl.value, input.trackingId, {
                  merchantClientId: oauthThirdParty.merchant_client_id,
                  merchantOauthEmail: record.merchantEmail,
                });

                // Create metadata manager
                const settingsManager = createSettingsManager(
                  createGraphQLClient({
                    saleorApiUrl: ctx.saleorApiUrl,
                    token: ctx.appToken,
                  }),
                  ctx.appId
                );
                const metadataManager = new PayPalMultiConfigMetadataManager(settingsManager);

                // Get current configuration for this tenant
                const configResult = await metadataManager.getAllConfigs();
                if (configResult.isOk()) {
                  const configs = configResult.value;

                  // Find or create the config for this merchant
                  // For now, we'll update the first config or create a new one
                  // TODO: In a multi-tenant setup, we should match by some tenant identifier
                  let existingConfig = configs.length > 0 ? configs[0] : null;

                  if (existingConfig) {
                    // Update existing config with merchant OAuth credentials
                    const updatedConfigResult = PayPalConfig.create({
                      id: existingConfig.id,
                      name: existingConfig.name,
                      clientId: existingConfig.clientId,
                      clientSecret: existingConfig.clientSecret,
                      environment: existingConfig.environment,
                      merchantClientId: oauthThirdParty.merchant_client_id,
                      merchantEmail: record.merchantEmail,
                      merchantId: status.merchant_id,
                    });

                    if (updatedConfigResult.isOk()) {
                      await metadataManager.saveConfig(updatedConfigResult.value);
                    }
                  } else {
                    // Create new config with partner credentials and merchant OAuth
                    const newConfigResult = PayPalConfig.create({
                      id: crypto.randomUUID(),
                      name: "PayPal Configuration",
                      clientId: paypalConfig.clientId,
                      clientSecret: paypalConfig.clientSecret,
                      environment: paypalConfig.environment,
                      merchantClientId: oauthThirdParty.merchant_client_id,
                      merchantEmail: record.merchantEmail,
                      merchantId: status.merchant_id,
                    });

                    if (newConfigResult.isOk()) {
                      await metadataManager.saveConfig(newConfigResult.value);
                    }
                  }
                }
              }
            } catch (error) {
              // Log error but don't fail the entire operation
              captureException(error);
              console.error("Failed to save merchant OAuth credentials:", error);
            }
          }

          return {
            success: true,
            readiness,
            onboardingStatus,
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
