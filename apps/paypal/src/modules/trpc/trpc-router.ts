import { appConfigRouter } from "@/modules/app-config/trpc-handlers/app-config-router";
import { merchantOnboardingRouter } from "@/modules/merchant-onboarding/trpc-handlers/merchant-onboarding-router";

import { router } from "./trpc-server";

export const trpcRouter = router({
  appConfig: appConfigRouter,
  merchantOnboarding: merchantOnboardingRouter,
});

export type TrpcRouter = typeof trpcRouter;
