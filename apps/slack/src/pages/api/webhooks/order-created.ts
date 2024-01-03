import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";

import { OrderCreatedWebhookPayloadFragment } from "../../../../generated/graphql";
import { createSettingsManager } from "../../../lib/metadata";
import { saleorApp } from "../../../lib/saleor-app";
import { sendSlackMessage } from "../../../lib/slack";
import { createGraphQLClient } from "@saleor/apps-shared";
import { WebhookActivityTogglerService } from "../../../lib/WebhookActivityToggler.service";
import { isValidUrl } from "../../../lib/is-valid-url";

const OrderCreatedWebhookPayload = gql`
  fragment OrderCreatedWebhookPayload on OrderCreated {
    order {
      userEmail
      id
      number
      user {
        email
        firstName
        lastName
      }
      shippingAddress {
        streetAddress1
        city
        postalCode
        country {
          country
        }
      }
      billingAddress {
        streetAddress1
        city
        postalCode
        country {
          country
        }
      }
      subtotal {
        gross {
          amount
          currency
        }
      }
      shippingPrice {
        gross {
          amount
          currency
        }
      }
      total {
        gross {
          amount
          currency
        }
      }
    }
  }
`;

const OrderCreatedGraphqlSubscription = gql`
  ${OrderCreatedWebhookPayload}
  subscription OrderCreated {
    event {
      ...OrderCreatedWebhookPayload
    }
  }
`;

export const orderCreatedWebhook = new SaleorAsyncWebhook<OrderCreatedWebhookPayloadFragment>({
  name: "Order Created in Saleor",
  webhookPath: "api/webhooks/order-created",
  event: "ORDER_CREATED",
  apl: saleorApp.apl,
  query: OrderCreatedGraphqlSubscription,
  isActive: false,
});

const handler: NextWebhookApiHandler<OrderCreatedWebhookPayloadFragment> = async (
  req,
  res,
  context,
) => {
  const { payload, authData } = context;

  const { saleorApiUrl, token, appId } = authData;

  const client = createGraphQLClient({
    saleorApiUrl,
    token,
  });

  const settings = createSettingsManager(client, appId);

  const webhookUrl = await settings.get("WEBHOOK_URL");

  if (!webhookUrl || !isValidUrl(webhookUrl)) {
    const webhooksToggler = new WebhookActivityTogglerService(appId, client);

    /**
     * If webhookUrl doesn't exist, it means app is not configured. Webhooks are disabled to prevent unnecessary
     * traffic.
     */
    await webhooksToggler.disableOwnWebhooks();

    return res.status(400).send({
      success: false,
      message: "The application has not been configured yet - Webhook URL is invalid or missing.",
    });
  }

  if (!payload.order) {
    return res.status(400).send({ success: false, message: "Order not found in request payload" });
  }

  const response = await sendSlackMessage(webhookUrl, {
    saleorApiUrl: authData.saleorApiUrl,
    order: payload.order,
  });

  if (response.status !== 200) {
    const errorMessage = await response.text();

    console.error(`Slack API responded with code ${response.status}: ${errorMessage}`);

    return res.status(500).send({
      success: false,
      message: `Slack API responded with status ${response.status}. Message: ${errorMessage}`,
    });
  }

  return res.status(200).send({ success: true, message: "Slack message sent!" });
};

export default orderCreatedWebhook.createHandler(handler);

export const config = {
  api: {
    bodyParser: false,
  },
};
