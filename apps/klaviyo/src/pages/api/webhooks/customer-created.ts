import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";

import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withOtel } from "@saleor/apps-otel";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/lib/observability-attributes";
import { createGraphQLClient } from "@saleor/apps-shared";
import {
  CustomerCreatedWebhookPayloadFragment,
  UntypedCustomerCreatedDocument,
} from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { Klaviyo } from "../../../lib/klaviyo";
import { createSettingsManager } from "../../../lib/metadata";
import { createLogger } from "../../../logger";
import { loggerContext } from "../../../logger-context";

const logger = createLogger("customerCreatedAsyncWebhookHandler");

const CustomerCreatedWebhookPayload = gql`
  fragment CustomerCreatedWebhookPayload on CustomerCreated {
    user {
      __typename
      id
      defaultShippingAddress {
        ...AddressFragment
      }
      defaultBillingAddress {
        ...AddressFragment
      }
      addresses {
        ...AddressFragment
      }
      privateMetadata {
        ...MetadataFragment
      }
      metadata {
        ...MetadataFragment
      }
      email
      firstName
      lastName
      isActive
      dateJoined
      languageCode
    }
  }
`;

export const CustomerCreatedGraphqlSubscription = gql`
  ${CustomerCreatedWebhookPayload}
  subscription CustomerCreated {
    event {
      ...CustomerCreatedWebhookPayload
    }
  }
`;

export const customerCreatedWebhook = new SaleorAsyncWebhook<CustomerCreatedWebhookPayloadFragment>(
  {
    name: "Customer Created",
    webhookPath: "api/webhooks/customer-created",
    event: "CUSTOMER_CREATED",
    apl: saleorApp.apl,
    query: UntypedCustomerCreatedDocument,
  },
);

const handler: NextWebhookApiHandler<CustomerCreatedWebhookPayloadFragment> = async (
  req,
  res,
  context,
) => {
  const { payload, authData } = context;
  const { saleorApiUrl, token, appId } = authData;

  loggerContext.set(ObservabilityAttributes.SALEOR_API_URL, saleorApiUrl);

  logger.info("customerCreatedWebhook handler called");

  const client = createGraphQLClient({
    saleorApiUrl,
    token,
  });

  const settings = createSettingsManager(client, appId);

  const klaviyoToken = await settings.get("PUBLIC_TOKEN");
  const klaviyoMetric = await settings.get("CUSTOMER_CREATED_METRIC");

  if (!klaviyoToken || !klaviyoMetric) {
    logger.warn("Request rejected - app not configured");
    return res.status(400).json({ success: false, message: "App not configured." });
  }

  const userEmail = payload.user?.email;

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
  withOtel(customerCreatedWebhook.createHandler(handler), "/api/webhooks/customer-created"),
  loggerContext,
);

export const config = {
  api: {
    bodyParser: false,
  },
};
