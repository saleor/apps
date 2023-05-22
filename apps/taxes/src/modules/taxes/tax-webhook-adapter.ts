export interface WebhookAdapter<TPayload, TResponse> {
  send(payload: TPayload): Promise<TResponse>;
}
