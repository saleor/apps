import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";

import {
  OrderCreatedWebhookPayloadFragment,
  UntypedOrderCreatedDocument,
} from "../../../../generated/graphql";
import { Klaviyo } from "../../../lib/klaviyo";
import { createSettingsManager } from "../../../lib/metadata";
import { saleorApp } from "../../../../saleor-app";
import { createGraphQLClient } from "@saleor/apps-shared";

const OrderCreatedWebhookPayload = gql`
  fragment OrderCreatedWebhookPayload on OrderCreated {
    order {
      ...OrderFragment
    }
  }
`;

export const OrderCreatedGraphqlSubscription = gql`
  ${OrderCreatedWebhookPayload}
  subscription OrderCreated {
    event {
      ...OrderCreatedWebhookPayload
    }
  }
`;

export const orderCreatedWebhook = new SaleorAsyncWebhook<OrderCreatedWebhookPayloadFragment>({
  name: "Order Created",
  webhookPath: "api/webhooks/order-created",
  event: "ORDER_CREATED",
  apl: saleorApp.apl,
  query: UntypedOrderCreatedDocument,
});

const handler: NextWebhookApiHandler<OrderCreatedWebhookPayloadFragment> = async (
  req,
  res,
  context
) => {
  console.debug("orderCreatedWebhook handler called");

  const { payload, authData } = context;
  const { saleorApiUrl, token, appId } = authData;
  const client = createGraphQLClient({
    saleorApiUrl,
    token,
  });
  const settings = createSettingsManager(client, appId);

  const klaviyoToken = await settings.get("PUBLIC_TOKEN");
  const klaviyoMetric = await settings.get("ORDER_CREATED_METRIC");

  if (!klaviyoToken || !klaviyoMetric) {
    console.debug("Request rejected - app not configured");
    return res.status(400).json({ success: false, message: "App not configured." });
  }

  const { userEmail } = payload.order || {};

  if (!userEmail) {
    console.debug("Request rejected - missing user email");
    return res.status(400).json({ success: false, message: "No user email." });
  }

  const klaviyoClient = Klaviyo(klaviyoToken);
  const klaviyoResponse = await klaviyoClient.send(klaviyoMetric, userEmail, payload);

  if (klaviyoResponse.status !== 200) {
    const klaviyoMessage = ` Message: ${(await klaviyoResponse.json())?.message}.` || "";

    console.debug("Klaviyo returned error: ", klaviyoMessage);
    return res.status(500).json({
      success: false,
      message: `Klaviyo API responded with status ${klaviyoResponse.status}.${klaviyoMessage}`,
    });
  }

  console.debug("Webhook processed successfully");
  return res.status(200).json({ success: true, message: "Message sent!" });
};

export default orderCreatedWebhook.createHandler(handler);

export const config = {
  api: {
    bodyParser: false,
  },
};
