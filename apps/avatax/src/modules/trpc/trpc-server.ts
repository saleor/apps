import { Permission } from "@saleor/app-sdk/types";
import * as Sentry from "@sentry/nextjs";
import { initTRPC } from "@trpc/server";
import { TrpcContext } from "./trpc-context";

interface Meta {
  requiredClientPermissions?: Permission[];
}

const t = initTRPC.context<TrpcContext>().meta<Meta>().create();

const sentryMiddleware = t.middleware(
  Sentry.Handlers.trpcMiddleware({
    attachRpcInput: true,
  }),
);

export const router = t.router;
export const procedure = t.procedure.use(sentryMiddleware);
export const middleware = t.middleware;
