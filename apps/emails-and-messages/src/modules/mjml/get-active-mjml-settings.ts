import { AuthData } from "@saleor/app-sdk/APL";
import { appRouter } from "../trpc/trpc-app-router";
import { logger as pinoLogger } from "../../lib/logger";

interface GetMjmlSettingsArgs {
  authData: AuthData;
  channel: string;
  configurationId: string;
}

export const getActiveMjmlSettings = async ({
  authData,
  channel,
  configurationId,
}: GetMjmlSettingsArgs) => {
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

  const configuration = await caller.mjmlConfiguration.getConfiguration({
    id: configurationId,
  });

  if (!configuration) {
    logger.warn(`The MJML configuration with id ${configurationId} does not exist`);
    return;
  }

  if (!configuration.active) {
    logger.warn(`The MJML configuration ${configuration.configurationName} is not active`);
    return;
  }

  return configuration;
};
