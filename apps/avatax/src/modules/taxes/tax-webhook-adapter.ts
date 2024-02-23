import { Result } from "neverthrow";
import { AvataxCalculateTaxesResponse } from "../avatax/calculate-taxes/avatax-calculate-taxes-adapter";

export interface WebhookAdapter<TPayload extends Record<string, any>, TResponse extends any> {
  send(payload: TPayload): Promise<Result<TResponse, Error>>;
}
