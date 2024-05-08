import { AuthData } from "@saleor/app-sdk/APL";
import { Client } from "urql";
import { SmtpConfigurationService } from "../smtp/configuration/smtp-configuration.service";
import { sendSmtp } from "../smtp/send-smtp";
import { SendgridConfigurationService } from "../sendgrid/configuration/sendgrid-configuration.service";
import { sendSendgrid } from "../sendgrid/send-sendgrid";
import { MessageEventTypes } from "./message-event-types";
import { SmtpPrivateMetadataManager } from "../smtp/configuration/smtp-metadata-manager";
import { createSettingsManager } from "../../lib/metadata-manager";
import { SendgridPrivateMetadataManager } from "../sendgrid/configuration/sendgrid-metadata-manager";
import { FeatureFlagService } from "../feature-flag-service/feature-flag-service";
import { createLogger } from "../../logger";

interface SendEventMessagesArgs {
  recipientEmail: string;
  channel: string;
  event: MessageEventTypes;
  authData: AuthData;
  payload: any;
  client: Client;
}

export const sendEventMessages = async ({
  recipientEmail,
  channel,
  event,
  authData,
  payload,
  client,
}: SendEventMessagesArgs) => {
  const logger = createLogger("sendEventMessages");

  logger.debug("Function called");

  const featureFlagService = new FeatureFlagService({
    client,
  });

  const smtpConfigurationService = new SmtpConfigurationService({
    metadataManager: new SmtpPrivateMetadataManager(
      createSettingsManager(client, authData.appId),
      authData.saleorApiUrl,
    ),
    featureFlagService,
  });

  const sendgridConfigurationService = new SendgridConfigurationService({
    metadataManager: new SendgridPrivateMetadataManager(
      createSettingsManager(client, authData.appId),
      authData.saleorApiUrl,
    ),
    featureFlagService,
  });

  // Fetch configurations for all providers concurrently
  const [availableSmtpConfigurations, availableSendgridConfigurations] = await Promise.all([
    smtpConfigurationService.getConfigurations({
      active: true,
      availableInChannel: channel,
    }),
    sendgridConfigurationService.getConfigurations({
      active: true,
      availableInChannel: channel,
    }),
  ]);

  for (const smtpConfiguration of availableSmtpConfigurations) {
    const smtpStatus = await sendSmtp({
      event,
      payload,
      recipientEmail,
      smtpConfiguration,
    });

    if (smtpStatus?.errors.length) {
      logger.error("SMTP errors");
      logger.error(smtpStatus?.errors);
    }
  }

  logger.debug("Channel has assigned Sendgrid configuration");

  for (const sendgridConfiguration of availableSendgridConfigurations) {
    const sendgridStatus = await sendSendgrid({
      event,
      payload,
      recipientEmail,
      sendgridConfiguration,
    });

    if (sendgridStatus?.errors.length) {
      logger.error("SendGrid errors");
      logger.error(sendgridStatus?.errors);
    }
  }
};
