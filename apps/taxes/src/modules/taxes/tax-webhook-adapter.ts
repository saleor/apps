import { AuthData } from "@saleor/app-sdk/APL";

export type WebhookAdapterParams = {
  authData: AuthData;
  configurationId: string;
};

export interface WebhookAdapter<TPayload extends Record<string, any>, TResponse extends any> {
  send(payload: TPayload): Promise<TResponse>;
}
