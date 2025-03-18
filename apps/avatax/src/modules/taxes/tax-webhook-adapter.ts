import { AuthData } from "@saleor/app-sdk/APL";

import { AvataxConfig } from "../avatax/avatax-connection-schema";
import {
  AutomaticallyDistributedProductLinesDiscountsStrategy,
  PriceReductionDiscountsStrategy,
} from "../avatax/discounts";

export interface WebhookAdapter<TPayload extends Record<string, any>, TResponse extends any> {
  send({
    payload,
    config,
    authData,
    discountsStrategy,
  }: {
    payload: TPayload;
    config: AvataxConfig;
    authData: AuthData;
    discountsStrategy:
      | AutomaticallyDistributedProductLinesDiscountsStrategy
      | PriceReductionDiscountsStrategy;
  }): Promise<TResponse>;
}
