import { channelsRouter } from "../channels/channels.router";
import { router } from "./trpc-server";
import { smtpConfigurationRouter } from "../smtp/configuration/smtp-configuration.router";
import { sendgridConfigurationRouter } from "../sendgrid/configuration/sendgrid-configuration.router";

export const appRouter = router({
  channels: channelsRouter,
  smtpConfiguration: smtpConfigurationRouter,
  sendgridConfiguration: sendgridConfigurationRouter,
});

export type AppRouter = typeof appRouter;
