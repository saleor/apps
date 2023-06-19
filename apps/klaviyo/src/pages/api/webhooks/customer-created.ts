import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";

import {
  CustomerCreatedDocument,
  CustomerCreatedWebhookPayloadFragment,
} from "../../../../generated/graphql";
import { Klaviyo } from "../../../lib/klaviyo";
import { createSettingsManager } from "../../../lib/metadata";
import { saleorApp } from "../../../../saleor-app";
import { createGraphQLClient } from "@saleor/apps-shared";

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
    query: CustomerCreatedDocument,
  }
);

const handler: NextWebhookApiHandler<CustomerCreatedWebhookPayloadFragment> = async (
  req,
  res,
  context
) => {
  console.debug("customerCreatedWebhook handler called");

  const { payload, authData } = context;
  const { saleorApiUrl, token, appId } = authData;
  const client = createGraphQLClient({
    saleorApiUrl,
    token,
  });

  const settings = createSettingsManager(client, appId);

  const klaviyoToken = await settings.get("PUBLIC_TOKEN");
  const klaviyoMetric = await settings.get("CUSTOMER_CREATED_METRIC");

  if (!klaviyoToken || !klaviyoMetric) {
    console.debug("Request rejected - app not configured");
    return res.status(400).json({ success: false, message: "App not configured." });
  }

  const userEmail = payload.user?.email;

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

export default customerCreatedWebhook.createHandler(handler);

export const config = {
  api: {
    bodyParser: false,
  },
};
