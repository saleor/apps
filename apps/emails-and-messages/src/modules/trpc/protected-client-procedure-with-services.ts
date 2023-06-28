import { createLogger } from "@saleor/apps-shared";
import { createSettingsManager } from "../../lib/metadata-manager";
import { SendgridConfigurationService } from "../sendgrid/configuration/sendgrid-configuration.service";
import { SendgridPrivateMetadataManager } from "../sendgrid/configuration/sendgrid-metadata-manager";
import { SmtpConfigurationService } from "../smtp/configuration/smtp-configuration.service";
import { SmtpPrivateMetadataManager } from "../smtp/configuration/smtp-metadata-manager";
import { syncWebhookStatus } from "../webhook-management/sync-webhook-status";
import { protectedClientProcedure } from "./protected-client-procedure";
import { WebhookManagementService } from "../webhook-management/webhook-management-service";
import { FeatureFlagService } from "../feature-flag-service/feature-flag-service";

const logger = createLogger({ name: "protectedWithConfigurationServices middleware" });

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
      metadataManager: new SmtpPrivateMetadataManager(
        createSettingsManager(ctx.apiClient, ctx.appId!),
        ctx.saleorApiUrl
      ),
      featureFlagService,
    });

    const sendgridConfigurationService = new SendgridConfigurationService({
      metadataManager: new SendgridPrivateMetadataManager(
        createSettingsManager(ctx.apiClient, ctx.appId!),
        ctx.saleorApiUrl
      ),
      featureFlagService,
    });

    const result = await next({
      ctx: {
        smtpConfigurationService,
        sendgridConfigurationService,
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
        sendgridConfigurationService,
        smtpConfigurationService,
        webhookManagementService,
      });
    }

    return result;
  }
);
