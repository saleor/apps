import { AuthData } from "@saleor/app-sdk/APL";
import { Client } from "urql";
import { logger as pinoLogger } from "../../lib/logger";
import { AppConfigurationService } from "../app-configuration/get-app-configuration.service";
import { MjmlConfigurationService } from "../mjml/configuration/get-mjml-configuration.service";
import { sendMjml } from "../mjml/send-mjml";
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
  const logger = pinoLogger.child({
    fn: "sendEventMessages",
  });

  logger.debug("Function called");

  const appConfigurationService = new AppConfigurationService({
    apiClient: client,
    saleorApiUrl: authData.saleorApiUrl,
  });

  const channelAppConfiguration = await appConfigurationService.getChannelConfiguration(channel);

  if (!channelAppConfiguration) {
    logger.warn("App has no configuration for this channel");
    return;
  }
  logger.debug("Channel has assigned app configuration");

  if (!channelAppConfiguration.active) {
    logger.warn("App configuration is not active for this channel");
    return;
  }

  if (channelAppConfiguration.mjmlConfigurationId) {
    logger.debug("Channel has assigned MJML configuration");

    const mjmlConfigurationService = new MjmlConfigurationService({
      apiClient: client,
      saleorApiUrl: authData.saleorApiUrl,
    });

    const mjmlConfiguration = await mjmlConfigurationService.getConfiguration({
      id: channelAppConfiguration.mjmlConfigurationId,
    });
    if (mjmlConfiguration) {
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
  }
  const sendgridStatus = await sendSendgrid({
    authData,
    channel,
    event,
    payload,
    recipientEmail,
  });

  if (sendgridStatus?.errors.length) {
    logger.error("Sending message with Sendgrid has failed");
    logger.error(sendgridStatus?.errors);
  }
};
