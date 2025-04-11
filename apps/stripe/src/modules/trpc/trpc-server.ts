import { Permission } from "@saleor/app-sdk/types";
import { TrpcContextAppRouter } from "@saleor/apps-trpc/context-app-router";
import { initTRPC } from "@trpc/server";
import { Client } from "urql";

import { AppConfigRepo } from "@/modules/app-config/app-config-repo";

interface Meta {
  requiredClientPermissions?: Permission[];
}

const t = initTRPC
  .context<
    TrpcContextAppRouter & {
      apiClient: Client;
      configRepo: AppConfigRepo;
    }
  >()
  .meta<Meta>()
  .create();

export const router = t.router;
export const procedure = t.procedure;
export const middleware = t.middleware;
