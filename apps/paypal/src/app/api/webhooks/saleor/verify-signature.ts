import { verifyWebhookSignature as verifySignature } from "@saleor/app-sdk/verify-webhook";

export const verifyWebhookSignature = (
  jwks: string,
  signature: string | undefined,
  rawBody: string,
): boolean => {
  return verifySignature(jwks, signature, rawBody);
};
