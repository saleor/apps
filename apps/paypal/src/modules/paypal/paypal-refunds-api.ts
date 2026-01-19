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
    requestId?: string;
  }): Promise<Result<PayPalRefund, unknown>> {
    // Generate a unique request ID for idempotency if not provided
    const requestId = args.requestId || `refund-${args.captureId}-${Date.now()}`;

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
        // Include BN code for partner attribution on refunds (per PayPal multiparty docs)
        includeBnCode: true,
        // Include request ID for idempotency (prevents duplicate refunds)
        requestId,
      }),
      (error) => error,
    );
  }
}
