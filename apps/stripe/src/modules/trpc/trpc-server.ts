import { Permission } from "@saleor/app-sdk/types";
import { TrpcContextAppRouter } from "@saleor/trpc/context-app-router";
import { initTRPC } from "@trpc/server";

interface Meta {
  requiredClientPermissions?: Permission[];
}

const t = initTRPC.context<TrpcContextAppRouter>().meta<Meta>().create();

export const router = t.router;
export const procedure = t.procedure;
export const middleware = t.middleware;
