import { GetStripeConfigTrpcHandler } from "@/modules/app-config/trpc-handlers/get-stripe-config-trpc-handler";
import { GetStripeConfigsListTrpcHandler } from "@/modules/app-config/trpc-handlers/get-stripe-configs-list-trpc-handler";
import { NewStripeConfigTrpcHandler } from "@/modules/app-config/trpc-handlers/new-stripe-config-trpc-handler";
import { router } from "@/modules/trpc/trpc-server";

/**
 * TODO Figure out end-to-end router testing (must somehow check valid jwt token)
 */
export const appConfigRouter = router({
  getStripeConfig: new GetStripeConfigTrpcHandler().getTrpcProcedure(),
  saveNewStripeConfig: new NewStripeConfigTrpcHandler().getTrpcProcedure(),
  getStripeConfigsList: new GetStripeConfigsListTrpcHandler().getTrpcProcedure(),
});
