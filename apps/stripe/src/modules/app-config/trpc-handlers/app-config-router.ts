import { GetSaleorChannelsTrpcHandler } from "@/modules/app-config/trpc-handlers/get-saleor-channels-trpc-handler";
import { GetStripeConfigsChannelsMappingTrpcHandler } from "@/modules/app-config/trpc-handlers/get-stripe-configs-channels-mapping-trpc-handler";
import { GetStripeConfigsListTrpcHandler } from "@/modules/app-config/trpc-handlers/get-stripe-configs-list-trpc-handler";
import { NewStripeConfigTrpcHandler } from "@/modules/app-config/trpc-handlers/new-stripe-config-trpc-handler";
import { RemoveStripeConfigTrpcHandler } from "@/modules/app-config/trpc-handlers/remove-stripe-config-trpc-handler";
import { UpdateMappingTrpcHandler } from "@/modules/app-config/trpc-handlers/update-mapping-trpc-handler";
import { ChannelsFetcher } from "@/modules/saleor/channel-fetcher";
import { StripeWebhookManager } from "@/modules/stripe/stripe-webhook-manager";
import { router } from "@/modules/trpc/trpc-server";

const webhookManager = new StripeWebhookManager();

/**
 * TODO Figure out end-to-end router testing (must somehow check valid jwt token)
 */
export const appConfigRouter = router({
  saveNewStripeConfig: new NewStripeConfigTrpcHandler({
    webhookManager,
  }).getTrpcProcedure(),
  getStripeConfigsList: new GetStripeConfigsListTrpcHandler().getTrpcProcedure(),
  fetchChannels: new GetSaleorChannelsTrpcHandler({
    channelsFetcherFactory: (client) => new ChannelsFetcher(client),
  }).getTrpcProcedure(),
  channelsConfigsMapping: new GetStripeConfigsChannelsMappingTrpcHandler().getTrpcProcedure(),
  updateMapping: new UpdateMappingTrpcHandler().getTrpcProcedure(),
  removeStripeConfig: new RemoveStripeConfigTrpcHandler({ webhookManager }).getTrpcProcedure(),
});
