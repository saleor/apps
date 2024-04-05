import { AvataxConfig } from "../avatax/avatax-connection-schema";
import { AuthData } from "@saleor/app-sdk/APL";

export interface WebhookAdapter<TPayload extends Record<string, any>, TResponse extends any> {
  send(payload: TPayload, config: AvataxConfig, authData: AuthData): Promise<TResponse>;
}
