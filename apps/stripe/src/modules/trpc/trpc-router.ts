import { appConfigRouter } from "@/modules/app-config/trpc-handlers/app-config-router";

import { router } from "./trpc-server";

export const trpcRouter = router({
  appConfig: appConfigRouter,
});

export type TrpcRouter = typeof trpcRouter;
