import { AuthData } from "@saleor/app-sdk/APL";
import { logger as pinoLogger } from "../../lib/logger";
import { sendMjml } from "../mjml/send-mjml";
import { sendSendgrid } from "../sendgrid/send-sendgrid";
import { appRouter } from "../trpc/trpc-app-router";
import { MessageEventTypes } from "./message-event-types";

interface SendEventMessagesArgs {
  recipientEmail: string;
  channel: string;
  event: MessageEventTypes;
  authData: AuthData;
  payload: any;
}

export const sendEventMessages = async ({
  recipientEmail,
  channel,
  event,
  authData,
  payload,
}: SendEventMessagesArgs) => {
  const logger = pinoLogger.child({
    fn: "sendEventMessages",
  });

  logger.debug("Function called");

  // get app configuration
  const caller = appRouter.createCaller({
    appId: authData.appId,
    saleorApiUrl: authData.saleorApiUrl,
    token: authData.token,
    ssr: true,
  });

  const appConfigurations = await caller.appConfiguration.fetch();
  const channelAppConfiguration = appConfigurations.configurationsPerChannel[channel];

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
    const mjmlStatus = await sendMjml({
      authData,
      channel,
      event,
      payload,
      recipientEmail,
      mjmlConfigurationId: channelAppConfiguration.mjmlConfigurationId,
    });

    if (mjmlStatus?.errors.length) {
      logger.error("MJML errors");
      logger.error(mjmlStatus?.errors);
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
