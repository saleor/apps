import { AuthData } from "@saleor/app-sdk/APL";
import { TaxBaseFragment } from "../../../../generated/graphql";
import { Logger, createLogger } from "../../../lib/logger";
import { CalculateTaxesResponse } from "../../taxes/tax-provider-webhook";
import { WebhookAdapter } from "../../taxes/tax-webhook-adapter";
import { AvataxClient, CreateTransactionArgs } from "../avatax-client";
import { AvataxConfig } from "../avatax-connection-schema";
import { AvataxCalculateTaxesPayloadService } from "./avatax-calculate-taxes-payload.service";
import { AvataxCalculateTaxesResponseTransformer } from "./avatax-calculate-taxes-response-transformer";

export const SHIPPING_ITEM_CODE = "Shipping";

export type AvataxCalculateTaxesPayload = {
  taxBase: TaxBaseFragment;
};

export type AvataxCalculateTaxesTarget = CreateTransactionArgs;
export type AvataxCalculateTaxesResponse = CalculateTaxesResponse;

export class AvataxCalculateTaxesAdapter
  implements WebhookAdapter<AvataxCalculateTaxesPayload, AvataxCalculateTaxesResponse>
{
  private logger: Logger;
  constructor(private readonly config: AvataxConfig, private ctx: AuthData) {
    this.logger = createLogger({ location: "AvataxCalculateTaxesAdapter" });
  }

  // todo: refactor because its getting too big
  async send(payload: AvataxCalculateTaxesPayload): Promise<AvataxCalculateTaxesResponse> {
    this.logger.debug({ payload }, "Transforming the following Saleor payload:");
    const payloadService = new AvataxCalculateTaxesPayloadService(this.ctx);
    const target = await payloadService.getPayload(payload.taxBase, this.config);

    this.logger.debug("Will call Avatax createTransaction with transformed payload");

    const client = new AvataxClient(this.config);
    const response = await client.createTransaction(target);

    this.logger.debug("Avatax createTransaction successfully responded");

    const responseTransformer = new AvataxCalculateTaxesResponseTransformer();
    const transformedResponse = responseTransformer.transform(response);

    this.logger.debug("Transformed Avatax createTransaction response");

    return transformedResponse;
  }
}
