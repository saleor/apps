import { AuthData } from "@saleor/app-sdk/APL";
import { Client } from "urql";
import { createLogger } from "@saleor/apps-shared";
import { SmtpConfigurationService } from "../smtp/configuration/smtp-configuration.service";
import { sendSmtp } from "../smtp/send-smtp";
import { SendgridConfigurationService } from "../sendgrid/configuration/sendgrid-configuration.service";
import { sendSendgrid } from "../sendgrid/send-sendgrid";
import { MessageEventTypes } from "./message-event-types";
import { SmtpPrivateMetadataManager } from "../smtp/configuration/smtp-metadata-manager";
import { createSettingsManager } from "../../lib/metadata-manager";
import { SendgridPrivateMetadataManager } from "../sendgrid/configuration/sendgrid-metadata-manager";
import { FeatureFlagService } from "../feature-flag-service/feature-flag-service";

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
  const logger = createLogger({
    fn: "sendEventMessages",
  });

  logger.debug("Function called");

  const featureFlagService = new FeatureFlagService({
    client,
  });

  const smtpConfigurationService = new SmtpConfigurationService({
    metadataManager: new SmtpPrivateMetadataManager(
      createSettingsManager(client, authData.appId),
      authData.saleorApiUrl
    ),
    featureFlagService,
  });

  const availableSmtpConfigurations = await smtpConfigurationService.getConfigurations({
    active: true,
    availableInChannel: channel,
  });

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

  const sendgridConfigurationService = new SendgridConfigurationService({
    metadataManager: new SendgridPrivateMetadataManager(
      createSettingsManager(client, authData.appId),
      authData.saleorApiUrl
    ),
    featureFlagService,
  });

  const availableSendgridConfigurations = await sendgridConfigurationService.getConfigurations({
    active: true,
    availableInChannel: channel,
  });

  for (const sendgridConfiguration of availableSendgridConfigurations) {
    const sendgridStatus = await sendSendgrid({
      event,
      payload,
      recipientEmail,
      sendgridConfiguration,
    });

    if (sendgridStatus?.errors.length) {
      logger.error("Sendgrid errors");
      logger.error(sendgridStatus?.errors);
    }
  }
};
