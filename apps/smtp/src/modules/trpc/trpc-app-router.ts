import { channelsRouter } from "../channels/channels.router";
import { router } from "./trpc-server";
import { smtpConfigurationRouter } from "../smtp/configuration/smtp-configuration.router";
import { appConfigurationRouter } from "../app-configuration/app-configuration.router";

export const appRouter = router({
  app: appConfigurationRouter,
  channels: channelsRouter,
  smtpConfiguration: smtpConfigurationRouter,
});

export type AppRouter = typeof appRouter;
