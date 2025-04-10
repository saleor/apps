import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { WebhookParams } from "@/app/api/stripe/webhook/webhook-params";

export const mockedSaleorChannelId = "Q2hhbm5lbDox";
export const mockedSaleorAppId = "saleor-app-id";
export const mockStripeWebhookSecretValue = "whsec_XYZ";
export const mockAppToken = "XXXYYYZZZ";
export const mockAppUrlBase = "https://my-app.saleor.app";
export const mockAdyenWebhookUrl = `${mockAppUrlBase}?${new URLSearchParams({
  [WebhookParams.saleorApiUrlSearchParam]: mockedSaleorApiUrl.url,
  [WebhookParams.channelIdSearchParam]: mockedSaleorChannelId,
}).toString()}`;
