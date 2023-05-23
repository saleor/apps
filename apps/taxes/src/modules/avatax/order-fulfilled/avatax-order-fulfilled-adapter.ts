import { OrderFulfilledSubscriptionFragment } from "../../../../generated/graphql";
import { Logger, createLogger } from "../../../lib/logger";
import { WebhookAdapter } from "../../taxes/tax-webhook-adapter";
import { AvataxClient, CommitTransactionArgs } from "../avatax-client";
import { AvataxConfig } from "../avatax-config";
import { AvataxOrderFulfilledPayloadTransformer } from "./avatax-order-fulfilled-payload-transformer";
import { AvataxOrderFulfilledResponseTransformer } from "./avatax-order-fulfilled-response-transformer";

export type Payload = {
  order: OrderFulfilledSubscriptionFragment;
  config: AvataxConfig;
};
export type Target = CommitTransactionArgs;
export type Response = { ok: true };

export class AvataxOrderFulfilledAdapter implements WebhookAdapter<Payload, Response> {
  private logger: Logger;

  constructor(private readonly config: AvataxConfig) {
    this.logger = createLogger({ service: "AvataxOrderFulfilledAdapter" });
  }

  async send(payload: Pick<Payload, "order">): Promise<Response> {
    this.logger.debug({ payload }, "send called with:");

    const payloadTransformer = new AvataxOrderFulfilledPayloadTransformer();
    const target = payloadTransformer.transform({ ...payload, config: this.config });

    const client = new AvataxClient(this.config);
    const response = await client.commitTransaction(target);

    this.logger.debug({ response }, "Avatax commitTransaction response:");

    const responseTransformer = new AvataxOrderFulfilledResponseTransformer();
    const transformedResponse = responseTransformer.transform(response);

    this.logger.debug({ transformedResponse }, "Transformed Avatax commitTransaction response to:");

    return transformedResponse;
  }
}
