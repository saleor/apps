import { middleware } from "./trpc-server";
import { Handlers } from "@sentry/nextjs";

// todo why its not used
export const sentryMiddleware = middleware(
  Handlers.trpcMiddleware({
    attachRpcInput: true,
  }),
);
