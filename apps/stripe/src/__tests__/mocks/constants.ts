import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { WebhookParams } from "@/app/api/webhooks/stripe/webhook-params";
import { SaleorMoney } from "@/modules/saleor/saleor-money";
import { createSaleorTransactionId } from "@/modules/saleor/saleor-transaction-id";

export const mockedSaleorChannelId = "Q2hhbm5lbDox";
export const mockedConfigurationId = "81f323bd-91e2-4838-ab6e-5affd81ffc3b";
export const mockedSaleorAppId = "saleor-app-id";
export const mockedAppToken = "XXXYYYZZZ";
export const mockAppUrlBase = "https://my-app.saleor.app";
export const mockAdyenWebhookUrl = `${mockAppUrlBase}?${new URLSearchParams({
  [WebhookParams.saleorApiUrlSearchParam]: mockedSaleorApiUrl,
  [WebhookParams.configurationIdIdSearchParam]: mockedConfigurationId,
  [WebhookParams.appIdSearchParam]: mockedSaleorAppId,
}).toString()}`;
/**
 *  @deprecated - use `mockedSaleorTransactionIdBranded` instead
 */
export const mockedSaleorTransactionId = "mocked-transaction-id";
export const mockedSaleorTransactionIdBranded = createSaleorTransactionId("mocked-transaction-id");

export const getMockedSaleorMoney = (amount: number = 10_00, currency: string = "usd") =>
  SaleorMoney.createFromStripe({
    amount,
    currency,
  })._unsafeUnwrap();
