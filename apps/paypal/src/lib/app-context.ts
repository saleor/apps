import { NextAppRouterHandler } from "@saleor/app-sdk/handlers/next-app-router";
import { AsyncLocalStorage } from "async_hooks";
import { NextRequest } from "next/server";

import { createLogger } from "@/lib/logger";
import { PayPalEnv } from "@/modules/paypal/paypal-env";

export type AppContext = {
  paypalEnv: PayPalEnv | null;
};

const defaultAppContext: AppContext = {
  paypalEnv: null,
};

export class AppContextContainer {
  private als = new AsyncLocalStorage<AppContext>();
  private logger = createLogger("AppContextContainer");

  private async initialize(
    fn: (...args: unknown[]) => Response | Promise<Response>,
    initialState: AppContext = defaultAppContext,
  ) {
    return this.als.run(
      {
        ...initialState,
      },
      fn,
    );
  }

  set(values: Partial<AppContext>) {
    const store = this.als.getStore();

    if (!store) {
      this.logger.warn("Trying to set value on AppContext not available in the context. Ignoring.");

      return;
    }

    for (const partialKey of Object.keys(values)) {
      const key = partialKey as keyof AppContext;

      if (key in store && values[key] !== undefined) {
        store[key] = values[key];
      } else {
        throw new Error(
          `Key ${key} does not exist in AppContext. Only known, predefined keys are allowed.`,
        );
      }
    }
  }

  getContextValue() {
    const store = this.als.getStore();

    if (!store) {
      this.logger.warn(
        "Trying to get value on AppContext not available in the context. Returning default value.",
      );

      return defaultAppContext;
    }

    return store;
  }

  wrapRequest = (handler: NextAppRouterHandler) => {
    return (req: NextRequest) => {
      return this.initialize(() => {
        return handler(req);
      });
    };
  };
}

export const appContextContainer = new AppContextContainer();
