import { SmtpConfigurationService } from "../smtp/configuration/smtp-configuration.service";
import { SendgridConfigurationService } from "../sendgrid/configuration/sendgrid-configuration.service";
import { WebhookManagementService, AppWebhook } from "./webhook-management-service";
import { getWebhookStatusesFromConfigurations } from "./get-webhook-statuses-from-configurations";
import { createLogger } from "../../logger";

const logger = createLogger("SyncWebhooksStatus");

interface SyncWebhooksStatusArgs {
  smtpConfigurationService: SmtpConfigurationService;
  sendgridConfigurationService: SendgridConfigurationService;
  webhookManagementService: WebhookManagementService;
}

/**
 *  Checks active events in configurations and updates webhooks in the API if needed.
 */
export const syncWebhookStatus = async ({
  smtpConfigurationService,
  sendgridConfigurationService,
  webhookManagementService,
}: SyncWebhooksStatusArgs) => {
  logger.debug("Pulling current webhook status from the API");
  const oldStatuses = await webhookManagementService.getWebhooksStatus();

  logger.debug("Generate expected webhook status based on current configurations");

  // API requests can be triggered if not cached yet
  const [activeSmtpConfigurations, activeSendgridConfigurations] = await Promise.all([
    smtpConfigurationService.getConfigurations(),
    sendgridConfigurationService.getConfigurations(),
  ]);

  const newStatuses = getWebhookStatusesFromConfigurations({
    smtpConfigurations: activeSmtpConfigurations,
    sendgridConfigurations: activeSendgridConfigurations,
  });

  logger.debug("Update webhooks in the API if needed");
  const apiMutationPromises = Object.keys(newStatuses).map(async (key) => {
    const webhook = key as AppWebhook;

    if (newStatuses[webhook] === oldStatuses[webhook]) {
      // Webhook status is already up to date
      return;
    }

    if (newStatuses[webhook]) {
      logger.debug(`Creating webhook ${webhook}`);
      return webhookManagementService.createWebhook({ webhook });
    } else {
      logger.debug(`Deleting webhook ${webhook}`);
      return webhookManagementService.deleteWebhook({ webhook });
    }
  });

  await Promise.all(apiMutationPromises);

  logger.debug("Webhooks status synchronized");
};
