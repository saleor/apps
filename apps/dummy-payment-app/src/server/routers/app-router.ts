import { router } from "../server";
import { checkoutRouter } from "./checkout.router";
import { transactionReporterRouter } from "./transaction-reporter.router";

export const appRouter = router({
  transactionReporter: transactionReporterRouter,
  checkout: checkoutRouter,
});

export type AppRouter = typeof appRouter;
