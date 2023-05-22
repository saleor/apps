export interface WebhookAdapter<TPayload extends Record<string, any>, TResponse extends any> {
  send(payload: TPayload): Promise<TResponse>;
}
