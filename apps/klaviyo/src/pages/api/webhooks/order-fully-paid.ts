import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";

import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withOtel } from "@saleor/apps-otel";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/lib/observability-attributes";
import { createGraphQLClient } from "@saleor/apps-shared";
import {
  OrderFullyPaidWebhookPayloadFragment,
  UntypedOrderFullyPaidDocument,
} from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { Klaviyo } from "../../../lib/klaviyo";
import { createSettingsManager } from "../../../lib/metadata";
import { createLogger } from "../../../logger";
import { loggerContext } from "../../../logger-context";

const logger = createLogger("orderFullyPaidAsyncWebhookHandler");

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
  context,
) => {
  const { payload, authData } = context;
  const { saleorApiUrl, token, appId } = authData;

  loggerContext.set(ObservabilityAttributes.SALEOR_API_URL, saleorApiUrl);

  logger.info("orderFullyPaidWebhook handler called");

  const client = createGraphQLClient({
    saleorApiUrl,
    token,
  });

  const settings = createSettingsManager(client, appId);

  const klaviyoToken = await settings.get("PUBLIC_TOKEN");
  const klaviyoMetric = await settings.get("ORDER_FULLY_PAID_METRIC");

  if (!klaviyoToken || !klaviyoMetric) {
    logger.warn("Request rejected - app not configured");
    return res.status(400).json({ success: false, message: "App not configured." });
  }

  const { userEmail } = payload.order || {};

  if (!userEmail) {
    logger.warn("Request rejected - missing user email");
    return res.status(400).json({ success: false, message: "No user email." });
  }

  const klaviyoClient = Klaviyo(klaviyoToken);
  const klaviyoResponse = await klaviyoClient.send(klaviyoMetric, userEmail, payload);

  if (klaviyoResponse.status !== 200) {
    const klaviyoMessage = ` Message: ${(await klaviyoResponse.json())?.message}.` || "";

    logger.error("Klaviyo returned error: ", {
      error: klaviyoMessage,
      status: klaviyoResponse.status,
    });

    return res.status(500).json({
      success: false,
      message: `Klaviyo API responded with status ${klaviyoResponse.status}.${klaviyoMessage}`,
    });
  }

  logger.info("Webhook processed successfully");

  return res.status(200).json({ success: true, message: "Message sent!" });
};

export default wrapWithLoggerContext(
  withOtel(orderFullyPaidWebhook.createHandler(handler), "/api/webhooks/order-fully-paid"),
  loggerContext,
);

export const config = {
  api: {
    bodyParser: false,
  },
};
