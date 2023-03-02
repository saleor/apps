import { SaleorSyncWebhook } from "../../lib/saleor/saleor-app-sdk";
import { ResponseTaxPayload } from "./types";
export class TaxSaleorSyncWebhook<TPayload = any> extends SaleorSyncWebhook<
  TPayload,
  ResponseTaxPayload
> {}
