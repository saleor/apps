import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";
import {
  ProductUpdatedWebhookPayloadFragment,
  ProductUpdatedWebhookPayloadFragmentDoc,
  ProductVariantUpdatedWebhookPayloadFragment,
  ProductVariantUpdatedWebhookPayloadFragmentDoc,
  WebhookProductFragmentDoc,
  WebhookProductVariantFragmentDoc,
} from "../../../../generated/graphql";

import { createWebhookConfigContext } from "@/modules/webhooks-operations/create-webhook-config-context";
import { WebhooksProcessorsDelegator } from "@/modules/webhooks-operations/webhooks-processors-delegator";
import { saleorApp } from "@/saleor-app";

export const config = {
  api: {
    bodyParser: false,
  },
};

gql`
  ${WebhookProductFragmentDoc}
  fragment ProductUpdatedWebhookPayload on ProductUpdated {
    product {
      ...WebhookProduct
    }
  }
`;

const Subscription = gql`
  ${ProductUpdatedWebhookPayloadFragmentDoc}
  subscription ProductUpdated {
    event {
      ...ProductUpdatedWebhookPayload
    }
  }
`;

export const productUpdatedWebhook = new SaleorAsyncWebhook<ProductUpdatedWebhookPayloadFragment>({
  name: "CMS App - Product Updated",
  webhookPath: "api/webhooks/product-updated",
  event: "PRODUCT_UPDATED",
  apl: saleorApp.apl,
  query: Subscription,
});

/*
 * todo extract services, delegate to providers
 * todo document that fields in contetnful should be unique
 * todo fetch metadata end decode it with payload
 */
const handler: NextWebhookApiHandler<ProductUpdatedWebhookPayloadFragment> = async (
  req,
  res,
  context
) => {
  const { authData, payload } = context;

  // todo

  console.log("todo");

  return res.status(200).end();
};

export default productUpdatedWebhook.createHandler(handler);
