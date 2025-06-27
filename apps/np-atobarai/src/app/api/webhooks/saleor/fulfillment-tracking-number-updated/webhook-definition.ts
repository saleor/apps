import { SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next-app-router";

import {
  FulfillmentTrackingNumberUpdatedDocument,
  FulfillmentTrackingNumberUpdatedEventFragment,
} from "@/generated/graphql";
import { saleorApp } from "@/lib/saleor-app";

export const fulfillmentTrackingNumberUpdatedWebhookDefinition =
  new SaleorAsyncWebhook<FulfillmentTrackingNumberUpdatedEventFragment>({
    apl: saleorApp.apl,
    // @ts-expect-error - missing type in Saleor App SDK - TODO: fix in SDK
    event: "FULFILLMENT_TRACKING_NUMBER_UPDATED",
    name: "NP Atobarai Fulfillment Tracking Number Updated",
    isActive: true,
    query: FulfillmentTrackingNumberUpdatedDocument,
    webhookPath: "api/webhooks/saleor/fulfillment-tracking-number-updated",
  });
