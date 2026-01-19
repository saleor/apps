import { TRPCError } from "@trpc/server";
import { publicProcedure } from "@/modules/trpc/public-procedure";
import { getPool } from "@/lib/database";
import { GlobalPayPalConfigRepository } from "../global-paypal-config-repository";
import { setGlobalConfigInputSchema } from "./wsm-admin-input-schemas";
import { PayPalWebhookManager } from "@/modules/paypal/paypal-webhook-manager";
import { createLogger } from "@/lib/logger";
import { env } from "@/lib/env";
import { z } from "zod";

const logger = createLogger("SetGlobalConfigHandler");

/**
 * Validate WSM super admin secret key
 */
function validateSuperAdminKey(secretKey: string) {
  const expectedKey = process.env.SUPER_ADMIN_SECRET_KEY;

  if (!expectedKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Super admin key not configured on server",
    });
  }

  if (secretKey !== expectedKey) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid super admin secret key",
    });
  }
}

/**
 * Get the webhook URL for PayPal platform events
 * Uses APP_API_BASE_URL environment variable
 */
function getWebhookUrl(): string | null {
  const baseUrl = env.APP_API_BASE_URL;

  if (!baseUrl) {
    logger.warn("APP_API_BASE_URL not configured, webhook registration will be skipped");
    return null;
  }

  // Remove trailing slash if present
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  return `${normalizedBaseUrl}/api/webhooks/paypal/platform-events`;
}

/**
 * Set global PayPal configuration (WSM admin only)
 *
 * This handler:
 * 1. Validates super admin authentication
 * 2. Saves the global configuration to the database
 * 3. Registers PayPal webhooks for platform events (if APP_API_BASE_URL is configured)
 * 4. Updates the config with the webhook ID
 */
export class SetGlobalConfigHandler {
  baseProcedure = publicProcedure;

  getTrpcProcedure() {
    return this.baseProcedure.input(setGlobalConfigInputSchema).mutation(async ({ input }: { input: z.infer<typeof setGlobalConfigInputSchema> }) => {
      // Validate super admin authentication
      validateSuperAdminKey(input.secretKey);

      const repository = GlobalPayPalConfigRepository.create(getPool());

      // First, save the basic config
      const configResult = await repository.upsertConfig({
        clientId: input.clientId,
        clientSecret: input.clientSecret,
        partnerMerchantId: input.partnerMerchantId,
        partnerFeePercent: input.partnerFeePercent,
        bnCode: input.bnCode,
        environment: input.environment,
      });

      if (configResult.isErr()) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to save configuration: ${configResult.error.message}`,
        });
      }

      const config = configResult.value;

      // Now try to register webhooks
      let webhookInfo: { webhookId: string; webhookUrl: string } | null = null;
      let webhookError: string | null = null;

      const webhookUrl = getWebhookUrl();

      if (webhookUrl) {
        logger.info("Attempting to register PayPal webhooks", {
          webhookUrl,
          environment: input.environment,
        });

        try {
          const webhookManager = PayPalWebhookManager.create({
            clientId: input.clientId,
            clientSecret: input.clientSecret,
            env: input.environment,
          });

          const webhookResult = await webhookManager.ensureWebhookRegistered({
            url: webhookUrl,
          });

          if (webhookResult.isOk()) {
            webhookInfo = {
              webhookId: webhookResult.value.webhookId,
              webhookUrl: webhookResult.value.webhookUrl,
            };

            // Update the config with webhook info
            const updateResult = await repository.updateWebhookInfo({
              webhookId: webhookInfo.webhookId,
              webhookUrl: webhookInfo.webhookUrl,
            });

            if (updateResult.isErr()) {
              logger.error("Failed to update config with webhook info", {
                error: updateResult.error.message,
              });
              webhookError = `Webhook registered but failed to save: ${updateResult.error.message}`;
            } else {
              logger.info("PayPal webhook registered and saved successfully", {
                webhookId: webhookInfo.webhookId,
                webhookUrl: webhookInfo.webhookUrl,
              });
            }
          } else {
            webhookError = webhookResult.error.message;
            logger.error("Failed to register PayPal webhook", {
              error: webhookError,
            });
          }
        } catch (error) {
          webhookError = error instanceof Error ? error.message : "Unknown error during webhook registration";
          logger.error("Exception during webhook registration", { error: webhookError });
        }
      } else {
        webhookError = "APP_API_BASE_URL not configured - webhook registration skipped";
        logger.warn(webhookError);
      }

      return {
        success: true,
        message: "Global PayPal configuration saved successfully",
        config: {
          id: config.id,
          environment: config.environment,
          createdAt: config.createdAt,
        },
        webhook: webhookInfo
          ? {
              registered: true,
              webhookId: webhookInfo.webhookId,
              webhookUrl: webhookInfo.webhookUrl,
            }
          : {
              registered: false,
              error: webhookError,
            },
      };
    });
  }
}
