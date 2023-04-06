import { router } from "./trpc-server";
import { MailchimpConfigRouter } from "../mailchimp/mailchimp-config.router";
import { MailchimpAudienceRouter } from "../mailchimp/mailchimp-audience.router";

export const appRouter = router({
  mailchimp: router({
    config: MailchimpConfigRouter.router,
    audience: MailchimpAudienceRouter.router,
  }),
});

export type AppRouter = typeof appRouter;
