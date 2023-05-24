import { AuthData } from "@saleor/app-sdk/APL";
import { Client } from "urql";
import { createLogger } from "@saleor/apps-shared";
import { SmtpConfigurationService } from "../smtp/configuration/get-smtp-configuration.service";
import { sendSmtp } from "../smtp/send-smtp";
import { SendgridConfigurationService } from "../sendgrid/configuration/get-sendgrid-configuration.service";
import { sendSendgrid } from "../sendgrid/send-sendgrid";
import { MessageEventTypes } from "./message-event-types";

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

  const smtpConfigurationService = new SmtpConfigurationService({
    apiClient: client,
    saleorApiUrl: authData.saleorApiUrl,
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
    apiClient: client,
    saleorApiUrl: authData.saleorApiUrl,
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
