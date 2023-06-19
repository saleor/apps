import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";

import {
  OrderFullyPaidWebhookPayloadFragment,
  UntypedOrderFullyPaidDocument,
} from "../../../../generated/graphql";
import { Klaviyo } from "../../../lib/klaviyo";
import { createSettingsManager } from "../../../lib/metadata";
import { saleorApp } from "../../../../saleor-app";
import { createGraphQLClient } from "@saleor/apps-shared";

const OrderFullyPaidWebhookPayload = gql`
  fragment OrderFullyPaidWebhookPayload on OrderFullyPaid {
    order {
      ...OrderFragment
    }
  }
`;

export const OrderFullyPaidGraphqlSubscription = gql`
  ${OrderFullyPaidWebhookPayload}
  subscription OrderFullyPaid {
    event {
      ...OrderFullyPaidWebhookPayload
    }
  }
`;

export const orderFullyPaidWebhook = new SaleorAsyncWebhook<OrderFullyPaidWebhookPayloadFragment>({
  name: "Order Fully Paid",
  webhookPath: "api/webhooks/order-fully-paid",
  event: "ORDER_FULLY_PAID",
  apl: saleorApp.apl,
  query: UntypedOrderFullyPaidDocument,
});

const handler: NextWebhookApiHandler<OrderFullyPaidWebhookPayloadFragment> = async (
  req,
  res,
  context
) => {
  console.debug("orderFullyPaidWebhook handler called");

  const { payload, authData } = context;
  const { saleorApiUrl, token, appId } = authData;
  const client = createGraphQLClient({
    saleorApiUrl,
    token,
  });

  const settings = createSettingsManager(client, appId);

  const klaviyoToken = await settings.get("PUBLIC_TOKEN");
  const klaviyoMetric = await settings.get("ORDER_FULLY_PAID_METRIC");

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

export default orderFullyPaidWebhook.createHandler(handler);

export const config = {
  api: {
    bodyParser: false,
  },
};
