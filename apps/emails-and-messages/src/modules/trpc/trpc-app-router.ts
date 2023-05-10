import { channelsRouter } from "../channels/channels.router";
import { router } from "./trpc-server";
import { mjmlConfigurationRouter } from "../smtp/configuration/mjml-configuration.router";
import { sendgridConfigurationRouter } from "../sendgrid/configuration/sendgrid-configuration.router";

export const appRouter = router({
  channels: channelsRouter,
  mjmlConfiguration: mjmlConfigurationRouter,
  sendgridConfiguration: sendgridConfigurationRouter,
});

export type AppRouter = typeof appRouter;
