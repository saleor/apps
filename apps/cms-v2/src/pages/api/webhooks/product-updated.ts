import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";
import {
  ProductUpdatedWebhookPayloadFragment,
  ProductUpdatedWebhookPayloadFragmentDoc,
  WebhookProductFragmentDoc,
} from "../../../../generated/graphql";

import { saleorApp } from "@/saleor-app";
import { createWebhookConfigContext } from "@/modules/webhooks-operations/create-webhook-config-context";
import { WebhooksProcessorsDelegator } from "@/modules/webhooks-operations/webhooks-processors-delegator";

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

const handler: NextWebhookApiHandler<ProductUpdatedWebhookPayloadFragment> = async (
  req,
  res,
  context
) => {
  const { authData, payload } = context;

  if (!payload.product) {
    // todo Sentry - should not happen
    return res.status(500).end();
  }

  const configContext = await createWebhookConfigContext({ authData });

  await new WebhooksProcessorsDelegator({
    context: configContext,
  }).delegateProductUpdatedOperations(payload.product);

  return res.status(200).end();
};

export default productUpdatedWebhook.createHandler(handler);
