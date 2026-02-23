import { type AuthData } from "@saleor/app-sdk/APL";

import { type AvataxConfig } from "../avatax/avatax-connection-schema";
import {
  type AutomaticallyDistributedProductLinesDiscountsStrategy,
  type PriceReductionDiscountsStrategy,
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
