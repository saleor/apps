import { router } from "../server";
import { transactionReporterRouter } from "./transaction-reporter.router";

export const appRouter = router({
  transactionReporter: transactionReporterRouter,
});

export type AppRouter = typeof appRouter;
