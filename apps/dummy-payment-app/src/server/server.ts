import { initTRPC } from "@trpc/server";

import { type Context } from "../pages/api/trpc/[trpc]";

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const procedure = t.procedure;
export const middleware = t.middleware;
