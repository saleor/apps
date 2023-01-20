import { initTRPC } from "@trpc/server";
import { TrpcContext } from "./trpc-context";

const t = initTRPC.context<TrpcContext>().create();

export const router = t.router;
export const procedure = t.procedure;
export const middleware = t.middleware;
