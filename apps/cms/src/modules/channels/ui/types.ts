import { ProductsVariantsSyncLoading } from "../../cms/hooks/useProductsVariantsSync";
import { ChannelsDataLoading } from "./hooks/useChannels";

export interface ChannelsLoading {
  channels: ChannelsDataLoading;
  productsVariantsSync: ProductsVariantsSyncLoading;
}
