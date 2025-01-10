import { appConfigurationRouter } from "../app-configuration/app-configuration.router";
import { channelsRouter } from "../channels/channels.router";
import { smtpConfigurationRouter } from "../smtp/configuration/smtp-configuration.router";
import { router } from "./trpc-server";

export const appRouter = router({
  app: appConfigurationRouter,
  channels: channelsRouter,
  smtpConfiguration: smtpConfigurationRouter,
});

export type AppRouter = typeof appRouter;
