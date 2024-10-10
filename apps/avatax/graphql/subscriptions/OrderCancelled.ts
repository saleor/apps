import { graphql, ResultOf } from "@/graphql";

import { WebhookMetadata } from "../fragments/WebhookMetadata";

const OrderCancelledSubscriptionFragment = graphql(`
  fragment OrderCancelledSubscription on Order {
    id
    avataxId: metafield(key: "avataxId")
    channel {
      id
      slug
    }
  }
`);

const OrderCancelledEventSubscriptionFragment = graphql(
  `
    fragment OrderCancelledEventSubscription on Event {
      __typename
      ...WebhookMetadata
      ... on OrderCancelled {
        order {
          ...OrderCancelledSubscription
        }
        recipient {
          privateMetadata {
            key
            value
          }
        }
      }
    }
  `,
  [WebhookMetadata, OrderCancelledSubscriptionFragment],
);

export const OrderCancelledSubscription = graphql(
  `
    subscription OrderCancelledSubscription {
      event {
        ...OrderCancelledEventSubscription
      }
    }
  `,
  [OrderCancelledEventSubscriptionFragment],
);

export type OrderCancelledEventSubscriptionFragmentResult = ResultOf<
  typeof OrderCancelledEventSubscriptionFragment
>;
