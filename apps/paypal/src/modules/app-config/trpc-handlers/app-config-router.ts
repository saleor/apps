import { GetSaleorChannelsTrpcHandler } from "@/modules/app-config/trpc-handlers/get-saleor-channels-trpc-handler";
import { GetPayPalConfigsChannelsMappingTrpcHandler } from "@/modules/app-config/trpc-handlers/get-paypal-configs-channels-mapping-trpc-handler";
import { GetPayPalConfigsListTrpcHandler } from "@/modules/app-config/trpc-handlers/get-paypal-configs-list-trpc-handler";
import { NewPayPalConfigTrpcHandler } from "@/modules/app-config/trpc-handlers/new-paypal-config-trpc-handler";
import { RemovePayPalConfigTrpcHandler } from "@/modules/app-config/trpc-handlers/remove-paypal-config-trpc-handler";
import { GetTenantConfigTrpcHandler } from "@/modules/app-config/trpc-handlers/get-tenant-config-trpc-handler";
import { SetTenantConfigTrpcHandler } from "@/modules/app-config/trpc-handlers/set-tenant-config-trpc-handler";
import { UpdateMappingTrpcHandler } from "@/modules/app-config/trpc-handlers/update-mapping-trpc-handler";
import { ChannelsFetcher } from "@/modules/saleor/channel-fetcher";
import { PayPalWebhookManager } from "@/modules/paypal/paypal-webhook-manager";
import { router } from "@/modules/trpc/trpc-server";


/**
 * TODO Figure out end-to-end router testing (must somehow check valid jwt token)
 */
export const appConfigRouter = router({
  saveNewPayPalConfig: new NewPayPalConfigTrpcHandler().getTrpcProcedure(),
  getPayPalConfigsList: new GetPayPalConfigsListTrpcHandler().getTrpcProcedure(),
  fetchChannels: new GetSaleorChannelsTrpcHandler({
    channelsFetcherFactory: (client) => new ChannelsFetcher(client),
  }).getTrpcProcedure(),
  getTenantConfig: new GetTenantConfigTrpcHandler().getTrpcProcedure(),
  setTenantConfig: new SetTenantConfigTrpcHandler().getTrpcProcedure(),
  channelsConfigsMapping: new GetPayPalConfigsChannelsMappingTrpcHandler().getTrpcProcedure(),
  updateMapping: new UpdateMappingTrpcHandler().getTrpcProcedure(),
  removePayPalConfig: new RemovePayPalConfigTrpcHandler().getTrpcProcedure(),
});
