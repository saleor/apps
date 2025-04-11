import { GetStripeConfigTrpcHandler } from "@/modules/app-config/trpc-handlers/get-stripe-config-trpc-handler";
import { newStripeConfigSchema } from "@/modules/app-config/trpc-handlers/save-new-stripe-config-trpc-handler";
import { protectedClientProcedure } from "@/modules/trpc/protected-client-procedure";
import { router } from "@/modules/trpc/trpc-server";

/**
 * TODO Figure out end-to-end router testing (must somehow check valid jwt token)
 */
export const appConfigRouter = router({
  getStripeConfig: new GetStripeConfigTrpcHandler().getTrpcProcedure(),
  saveNewStripeConfig: protectedClientProcedure
    .input(newStripeConfigSchema)
    .query(({ ctx, input }) => {}),
});
