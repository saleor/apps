import { GetConfigsChannelsMappingTrpcHandler } from "@/modules/app-config/trpc-handlers/get-configs-channels-mapping-trpc-handler";
import { GetConfigsListTrpcHandler } from "@/modules/app-config/trpc-handlers/get-configs-list-trpc-handler";
import { GetSaleorChannelsTrpcHandler } from "@/modules/app-config/trpc-handlers/get-saleor-channels-trpc-handler";
import { NewConfigTrpcHandler } from "@/modules/app-config/trpc-handlers/new-config-trpc-handler";
import { RemoveConfigTrpcHandler } from "@/modules/app-config/trpc-handlers/remove-config-trpc-handler";
import { UpdateMappingTrpcHandler } from "@/modules/app-config/trpc-handlers/update-mapping-trpc-handler";
import { ChannelsFetcher } from "@/modules/saleor/channel-fetcher";
import { router } from "@/modules/trpc/trpc-server";

/**
 * TODO Figure out end-to-end router testing (must somehow check valid jwt token)
 */
export const appConfigRouter = router({
  saveNewStripeConfig: new NewConfigTrpcHandler().getTrpcProcedure(),
  getStripeConfigsList: new GetConfigsListTrpcHandler().getTrpcProcedure(),
  fetchChannels: new GetSaleorChannelsTrpcHandler({
    channelsFetcherFactory: (client) => new ChannelsFetcher(client),
  }).getTrpcProcedure(),
  channelsConfigsMapping: new GetConfigsChannelsMappingTrpcHandler().getTrpcProcedure(),
  updateMapping: new UpdateMappingTrpcHandler().getTrpcProcedure(),
  removeStripeConfig: new RemoveConfigTrpcHandler().getTrpcProcedure(),
});
