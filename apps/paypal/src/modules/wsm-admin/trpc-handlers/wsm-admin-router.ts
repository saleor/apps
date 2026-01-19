import { router } from "@/modules/trpc/trpc-server";
import { GetGlobalConfigHandler } from "./get-global-config-handler";
import { SetGlobalConfigHandler } from "./set-global-config-handler";
import { TestCredentialsHandler } from "./test-credentials-handler";

/**
 * WSM Admin Router
 * Routes for super admin configuration of global PayPal credentials
 * Protected by SUPER_ADMIN_SECRET_KEY environment variable
 */
export const wsmAdminRouter = router({
  getGlobalConfig: new GetGlobalConfigHandler().getTrpcProcedure(),
  setGlobalConfig: new SetGlobalConfigHandler().getTrpcProcedure(),
  testCredentials: new TestCredentialsHandler().getTrpcProcedure(),
});
