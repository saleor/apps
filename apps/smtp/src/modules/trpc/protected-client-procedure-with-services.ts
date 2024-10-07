import { createSettingsManager } from "../../lib/metadata-manager";
import { createLogger } from "../../logger";
import { FeatureFlagService } from "../feature-flag-service/feature-flag-service";
import { SmtpConfigurationService } from "../smtp/configuration/smtp-configuration.service";
import { SmtpMetadataManager } from "../smtp/configuration/smtp-metadata-manager";
import { TemplateStringCompressor } from "../smtp/services/template-string-compressor";
import { TemplateStringValidator } from "../smtp/services/template-string-validator";
import { syncWebhookStatus } from "../webhook-management/sync-webhook-status";
import { WebhookManagementService } from "../webhook-management/webhook-management-service";
import { protectedClientProcedure } from "./protected-client-procedure";

const logger = createLogger("protectedWithConfigurationServices middleware");

/*
 * Allow access only for the dashboard users and attaches the
 * configuration service to the context.
 * The services do not fetch data from the API unless they are used.
 * If meta key updateWebhooks is set to true, additional calls to the API will be made
 * to create or remove webhooks.
 */
export const protectedWithConfigurationServices = protectedClientProcedure.use(
  async ({ next, ctx, meta }) => {
    /*
     * TODO: When App Bridge will add Saleor Version do the context,
     * extract it from there and pass it to the service constructor.
     * It will reduce additional call to the API.
     */
    const featureFlagService = new FeatureFlagService({
      client: ctx.apiClient,
    });

    const smtpConfigurationService = new SmtpConfigurationService({
      metadataManager: new SmtpMetadataManager(
        createSettingsManager(ctx.apiClient, ctx.appId!),
        ctx.saleorApiUrl,
      ),
      featureFlagService,
      templateStringValidator: new TemplateStringValidator(),
      templateStringCompressor: new TemplateStringCompressor(),
    });

    const result = await next({
      ctx: {
        smtpConfigurationService,
        featureFlagService,
      },
    });

    if (meta?.updateWebhooks) {
      logger.debug("Updating webhooks");

      const webhookManagementService = new WebhookManagementService({
        appBaseUrl: ctx.baseUrl,
        client: ctx.apiClient,
        featureFlagService: featureFlagService,
      });

      await syncWebhookStatus({
        smtpConfigurationService,
        webhookManagementService,
      });
    }

    return result;
  },
);
