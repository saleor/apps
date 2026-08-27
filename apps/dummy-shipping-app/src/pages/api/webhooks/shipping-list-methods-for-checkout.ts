import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import { createGraphQLClient } from "@saleor/apps-shared/create-graphql-client";
import { gql } from "urql";

import {
  FetchDeliveryMethodForCheckoutDocument,
  type ShippingListMethodsPayloadFragment,
} from "@/generated/graphql";
import { DummyExternalShippingAPI } from "@/lib/dummy-shipping";
import { saleorApp } from "@/saleor-app";

const ShippingListMethodsPayload = gql`
  fragment ShippingListMethodsPayload on ShippingListMethodsForCheckout {
    checkout {
      id
      shippingAddress {
        firstName
        lastName
        streetAddress1
        streetAddress2
        city
        postalCode
        country {
          code
        }
        phone
      }
    }
  }
`;

const ShippingListMethodsForCheckoutSubscription = gql`
  ${ShippingListMethodsPayload}
  subscription ShippingListMethodsForCheckout {
    event {
      ...ShippingListMethodsPayload
    }
  }
`;

export const shippingListMethodsForCheckoutWebhook =
  new SaleorSyncWebhook<ShippingListMethodsPayloadFragment>({
    name: "Shipping List Methods for Checkout",
    webhookPath: "api/webhooks/shipping-list-methods-for-checkout",
    event: "SHIPPING_LIST_METHODS_FOR_CHECKOUT",
    apl: saleorApp.apl,
    query: ShippingListMethodsForCheckoutSubscription,
  });

export default shippingListMethodsForCheckoutWebhook.createHandler(async (_req, res, ctx) => {
  const { payload, authData } = ctx;

  /**
   * A real integration would use the delivery method already selected on the checkout to
   * narrow down what the carrier is asked for. Here it only demonstrates that the webhook
   * can call back into Saleor with the app's own token.
   */
  const client = createGraphQLClient({
    saleorApiUrl: authData.saleorApiUrl,
    token: authData.token,
  });

  await client
    .query(FetchDeliveryMethodForCheckoutDocument, {
      checkoutId: payload.checkout?.id ?? "",
    })
    .toPromise();

  const dummyAPI = new DummyExternalShippingAPI();

  return res.status(200).json(dummyAPI.getShippingMethodsForCheckout());
});

export const config = {
  api: {
    bodyParser: false,
  },
};
