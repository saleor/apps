import { createLogger } from "@saleor/apps-shared";
import { createSettingsManager } from "../../lib/metadata-manager";
import { SendgridConfigurationService } from "../sendgrid/configuration/sendgrid-configuration.service";
import { SendgridPrivateMetadataManager } from "../sendgrid/configuration/sendgrid-metadata-manager";
import { SmtpConfigurationService } from "../smtp/configuration/smtp-configuration.service";
import { SmtpPrivateMetadataManager } from "../smtp/configuration/smtp-metadata-manager";
import { syncWebhookStatus } from "../webhook-management/sync-webhook-status";
import { protectedClientProcedure } from "./protected-client-procedure";
import { WebhookManagementService } from "../webhook-management/webhook-management-service";

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
    const smtpConfigurationService = new SmtpConfigurationService({
      metadataManager: new SmtpPrivateMetadataManager(
        createSettingsManager(ctx.apiClient, ctx.appId!),
        ctx.saleorApiUrl
      ),
    });

    const sendgridConfigurationService = new SendgridConfigurationService({
      metadataManager: new SendgridPrivateMetadataManager(
        createSettingsManager(ctx.apiClient, ctx.appId!),
        ctx.saleorApiUrl
      ),
    });

    const result = await next({
      ctx: {
        smtpConfigurationService,
        sendgridConfigurationService,
      },
    });

    if (meta?.updateWebhooks) {
      logger.debug("Updating webhooks");

      const webhookManagementService = new WebhookManagementService(ctx.baseUrl, ctx.apiClient);

      await syncWebhookStatus({
        sendgridConfigurationService,
        smtpConfigurationService,
        webhookManagementService,
      });
    }

    return result;
  }
);
