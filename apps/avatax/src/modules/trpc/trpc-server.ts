import { Permission } from "@saleor/app-sdk/types";
import { initTRPC } from "@trpc/server";

import { TrpcContext } from "./trpc-context";

interface Meta {
  requiredClientPermissions?: Permission[];
}

const t = initTRPC.context<TrpcContext>().meta<Meta>().create();

export const router = t.router;
export const procedure = t.procedure;
export const middleware = t.middleware;
