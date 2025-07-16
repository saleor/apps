import { GetConfigsChannelsMappingTrpcHandler } from "@/modules/app-config/trpc-handlers/get-configs-channels-mapping-trpc-handler";
import { GetConfigsListTrpcHandler } from "@/modules/app-config/trpc-handlers/get-configs-list-trpc-handler";
import { GetSaleorChannelsTrpcHandler } from "@/modules/app-config/trpc-handlers/get-saleor-channels-trpc-handler";
import { NewConfigTrpcHandler } from "@/modules/app-config/trpc-handlers/new-config-trpc-handler";
import { RemoveConfigTrpcHandler } from "@/modules/app-config/trpc-handlers/remove-config-trpc-handler";
import { UpdateMappingTrpcHandler } from "@/modules/app-config/trpc-handlers/update-mapping-trpc-handler";
import { AtobaraiApiClientFactory } from "@/modules/atobarai/atobarai-api-client-factory";
import { ChannelsFetcher } from "@/modules/saleor/channel-fetcher";
import { router } from "@/modules/trpc/trpc-server";

export const appConfigRouter = router({
  saveNewConfig: new NewConfigTrpcHandler({
    atobaraiClientFactory: new AtobaraiApiClientFactory(),
  }).getTrpcProcedure(),
  getConfigsList: new GetConfigsListTrpcHandler().getTrpcProcedure(),
  fetchChannels: new GetSaleorChannelsTrpcHandler({
    channelsFetcherFactory: (client) => new ChannelsFetcher(client),
  }).getTrpcProcedure(),
  channelsConfigsMapping: new GetConfigsChannelsMappingTrpcHandler().getTrpcProcedure(),
  updateMapping: new UpdateMappingTrpcHandler().getTrpcProcedure(),
  removeConfig: new RemoveConfigTrpcHandler().getTrpcProcedure(),
});
