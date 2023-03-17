import { router } from "./trpc-server";
import { MailchimpConfigRouter } from "../mailchimp/mailchimp-config.router";

export const appRouter = router({
  mailchimp: MailchimpConfigRouter.router,
});

export type AppRouter = typeof appRouter;
