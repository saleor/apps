import { configurationRouter } from "../configuration/configuration.router";
import { router } from "./trpc-server";

export const appRouter = router({
  configuration: configurationRouter,
});

export type AppRouter = typeof appRouter;
