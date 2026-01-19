import { Result, ResultAsync } from "neverthrow";

import { PayPalClient } from "./paypal-client";
import { PayPalClientId } from "./paypal-client-id";
import { PayPalClientSecret } from "./paypal-client-secret";
import { PayPalMerchantId } from "./paypal-merchant-id";
import { PayPalEnv } from "./paypal-env";
import { PayPalMoney } from "./paypal-money";
import { IPayPalRefundsApi, PayPalRefund } from "./types";

export class PayPalRefundsApi implements IPayPalRefundsApi {
  private client: PayPalClient;

  private constructor(client: PayPalClient) {
    this.client = client;
  }

  static create(args: {
    clientId: PayPalClientId;
    clientSecret: PayPalClientSecret;
    partnerMerchantId?: string | null;
    merchantId?: PayPalMerchantId | null;
    merchantEmail?: string | null;
    bnCode?: string | null;
    env: PayPalEnv;
  }): PayPalRefundsApi {
    const client = PayPalClient.create(args);
    return new PayPalRefundsApi(client);
  }

  async refundCapture(args: {
    captureId: string;
    amount?: PayPalMoney;
    metadata?: Record<string, string>;
  }): Promise<Result<PayPalRefund, unknown>> {
    return ResultAsync.fromPromise(
      this.client.makeRequest<PayPalRefund>({
        method: "POST",
        path: `/v2/payments/captures/${args.captureId}/refund`,
        body: {
          ...(args.amount && { amount: args.amount }),
          ...(args.metadata && {
            note_to_payer: JSON.stringify(args.metadata),
          }),
        },
      }),
      (error) => error,
    );
  }
}
