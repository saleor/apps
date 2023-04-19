import { AuthData } from "@saleor/app-sdk/APL";
import { Client } from "urql";
import { createLogger } from "@saleor/apps-shared";
import { MjmlConfigurationService } from "../mjml/configuration/get-mjml-configuration.service";
import { sendMjml } from "../mjml/send-mjml";
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

  const mjmlConfigurationService = new MjmlConfigurationService({
    apiClient: client,
    saleorApiUrl: authData.saleorApiUrl,
  });

  const availableMjmlConfigurations = await mjmlConfigurationService.getConfigurations({
    active: true,
    availableInChannel: channel,
  });

  for (const mjmlConfiguration of availableMjmlConfigurations) {
    const mjmlStatus = await sendMjml({
      event,
      payload,
      recipientEmail,
      mjmlConfiguration,
    });

    if (mjmlStatus?.errors.length) {
      logger.error("MJML errors");
      logger.error(mjmlStatus?.errors);
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
