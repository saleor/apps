import { OrderFulfilledSubscriptionFragment } from "../../../../generated/graphql";
import { Logger, createLogger } from "../../../lib/logger";
import { WebhookAdapter } from "../../taxes/tax-webhook-adapter";
import { AvataxClient, CommitTransactionArgs } from "../avatax-client";
import { AvataxConfig } from "../avatax-config";
import { AvataxOrderFulfilledPayloadTransformer } from "./avatax-order-fulfilled-payload-transformer";
import { AvataxOrderFulfilledResponseTransformer } from "./avatax-order-fulfilled-response-transformer";

export type AvataxOrderFulfilledPayload = {
  order: OrderFulfilledSubscriptionFragment;
};
export type AvataxOrderFulfilledTarget = CommitTransactionArgs;
export type AvataxOrderFulfilledResponse = { ok: true };

export class AvataxOrderFulfilledAdapter
  implements WebhookAdapter<AvataxOrderFulfilledPayload, AvataxOrderFulfilledResponse>
{
  private logger: Logger;

  constructor(private readonly config: AvataxConfig) {
    this.logger = createLogger({ service: "AvataxOrderFulfilledAdapter" });
  }

  async send(payload: AvataxOrderFulfilledPayload): Promise<AvataxOrderFulfilledResponse> {
    this.logger.debug({ payload }, "send called with:");

    const payloadTransformer = new AvataxOrderFulfilledPayloadTransformer(this.config);
    const target = payloadTransformer.transform({ ...payload });

    const client = new AvataxClient(this.config);
    const response = await client.commitTransaction(target);

    this.logger.debug({ response }, "Avatax commitTransaction response:");

    const responseTransformer = new AvataxOrderFulfilledResponseTransformer();
    const transformedResponse = responseTransformer.transform(response);

    this.logger.debug({ transformedResponse }, "Transformed Avatax commitTransaction response to:");

    return transformedResponse;
  }
}
