import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { WebhookParams } from "@/app/api/stripe/webhook/webhook-params";

export const mockedSaleorChannelId = "Q2hhbm5lbDox";
export const mockedConfigurationId = "81f323bd-91e2-4838-ab6e-5affd81ffc3b";
export const mockedSaleorAppId = "saleor-app-id";
export const mockStripeWebhookSecretValue = "whsec_XYZ";
export const mockedAppToken = "XXXYYYZZZ";
export const mockAppUrlBase = "https://my-app.saleor.app";
export const mockAdyenWebhookUrl = `${mockAppUrlBase}?${new URLSearchParams({
  [WebhookParams.saleorApiUrlSearchParam]: mockedSaleorApiUrl,
  [WebhookParams.configurationIdIdSearchParam]: mockedConfigurationId,
}).toString()}`;
