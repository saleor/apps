import { TRPCClientError } from "@trpc/client";
import { GraphQLError } from "graphql";

import { BaseError } from "../error";
import { logger } from "../logger";
import { CalculateTaxesPayload } from "../modules/webhooks/payloads/calculate-taxes-payload";
import { OrderCancelledPayload } from "../modules/webhooks/payloads/order-cancelled-payload";
import { OrderConfirmedPayload } from "../modules/webhooks/payloads/order-confirmed-payload";

export function resolveTrpcClientError(error: unknown) {
  if (error instanceof TRPCClientError) {
    return error.message;
  }

  return "Unknown error";
}

export class SubscriptionPayloadErrorChecker {
  static SubscriptionPayloadError = BaseError.subclass("SubscriptionPayloadError");

  private handledErrorPath = ["event", "taxBase", "sourceObject", "user"];

  constructor(
    private injectedLogger: Pick<typeof logger, "error" | "info">,
    private injectedErrorCapture: (
      exception: InstanceType<typeof SubscriptionPayloadErrorChecker.SubscriptionPayloadError>,
    ) => void,
  ) {}

  checkPayload(payload: CalculateTaxesPayload | OrderCancelledPayload | OrderConfirmedPayload) {
    // @ts-expect-error errors field is not yet typed on subscription payloads
    const possibleErrors = payload?.errors as GraphQLError[];

    const subscription = payload.__typename;

    if (possibleErrors) {
      possibleErrors.forEach((error) => {
        const graphQLError = new SubscriptionPayloadErrorChecker.SubscriptionPayloadError(
          error.message,
          {
            props: {
              subscription,
              source: error.source,
              path: error.path,
            },
          },
        );

        if (this.handledErrorPath.every((path) => graphQLError.path?.includes(path))) {
          // This is handled error - app don't have access to user object. We should migrate clients to use metadata on checkout/order objects instead.
          this.injectedLogger.info(`Payload contains handled GraphQL error for ${subscription}`, {
            error: graphQLError,
            subscription,
          });
          return;
        }

        this.injectedLogger.error(`Payload contains unhandled GraphQL error for ${subscription}`, {
          error: graphQLError,
          subscription,
        });

        this.injectedErrorCapture(graphQLError);
      });
    }
  }
}
