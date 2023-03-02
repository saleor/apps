import { initTRPC } from "@trpc/server";
import { TrpcContext } from "./trpc-context";
import { AppPermission } from "@saleor/app-sdk/types";

interface Meta {
  requiredClientPermissions?: AppPermission[];
}

const t = initTRPC.context<TrpcContext>().meta<Meta>().create();

export const router = t.router;
export const procedure = t.procedure;
export const middleware = t.middleware;
