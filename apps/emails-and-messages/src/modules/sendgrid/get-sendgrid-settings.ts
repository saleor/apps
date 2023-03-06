import { AuthData } from "@saleor/app-sdk/APL";
import { appRouter } from "../trpc/trpc-app-router";
import { logger as pinoLogger } from "../../lib/logger";

interface GetSendgridSettingsArgs {
  authData: AuthData;
  channel: string;
}

export const getSendgridSettings = async ({ authData, channel }: GetSendgridSettingsArgs) => {
  const logger = pinoLogger.child({
    fn: "getMjmlSettings",
    channel,
  });
  const caller = appRouter.createCaller({
    appId: authData.appId,
    saleorApiUrl: authData.saleorApiUrl,
    token: authData.token,
    ssr: true,
  });

  const sendgridConfigurations = await caller.sendgridConfiguration.fetch();
  const appConfigurations = await caller.appConfiguration.fetch();

  const channelAppConfiguration = appConfigurations.configurationsPerChannel[channel];
  if (!channelAppConfiguration) {
    logger.warn("App has no configuration for this channel");
    return;
  }

  if (!channelAppConfiguration.active) {
    logger.warn("App configuration is not active for this channel");
    return;
  }

  const sendgridConfigurationId = channelAppConfiguration.sendgridConfigurationId;
  if (!sendgridConfigurationId?.length) {
    logger.warn("Sendgrid configuration has not been chosen for this channel");
    return;
  }

  const configuration = sendgridConfigurations?.availableConfigurations[sendgridConfigurationId];
  if (!configuration) {
    logger.warn(`The Sendgrid configuration with id ${sendgridConfigurationId} does not exist`);
    return;
  }

  if (!configuration.active) {
    logger.warn(`The Sendgrid configuration ${configuration.configurationName} is not active`);
    return;
  }

  return configuration;
};
