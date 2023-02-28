import { SaleorSyncWebhook } from "../../lib/saleor/saleor-app-sdk";
import { ResponseTaxPayload } from "../../lib/saleor/types";
export class TaxSaleorSyncWebhook<TPayload = any> extends SaleorSyncWebhook<
  TPayload,
  ResponseTaxPayload
> {}
