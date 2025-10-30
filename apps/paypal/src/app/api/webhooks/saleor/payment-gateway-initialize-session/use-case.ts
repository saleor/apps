import { err, ok, Result } from "neverthrow";

import {
  AppIsNotConfiguredResponse,
  BrokenAppResponse,
} from "@/app/api/webhooks/saleor/saleor-webhook-responses";
import { appContextContainer } from "@/lib/app-context";
import { BaseError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { PayPalConfigRepo } from "@/modules/paypal/configuration/paypal-config-repo";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";

import {
  PaymentGatewayInitializeSessionUseCaseResponses,
  PaymentGatewayInitializeSessionUseCaseResponsesType,
} from "./use-case-response";

export class PaymentGatewayInitializeSessionUseCase {
  private paypalConfigRepo: PayPalConfigRepo;
  private logger = createLogger("PaymentGatewayInitializeSessionUseCase");

  static UseCaseError = BaseError.subclass("PaymentGatewayInitializeSessionUseCaseError", {
    props: {
      _internalName: "InitializePayPalSessionUseCaseError" as const,
    },
  });

  constructor(deps: { paypalConfigRepo: PayPalConfigRepo }) {
    this.paypalConfigRepo = deps.paypalConfigRepo;
  }

  async execute(params: {
    channelId: string;
    authData: import("@saleor/app-sdk/APL").AuthData;
  }): Promise<
    Result<
      PaymentGatewayInitializeSessionUseCaseResponsesType,
      AppIsNotConfiguredResponse | BrokenAppResponse
    >
  > {
    const { channelId, authData } = params;

    const paypalConfigForThisChannel = await this.paypalConfigRepo.getPayPalConfig(authData);

    if (paypalConfigForThisChannel.isOk()) {
      const config = paypalConfigForThisChannel.value;

      if (!config) {
        this.logger.warn("Config for channel not found", {
          channelId,
        });

        return err(
          new AppIsNotConfiguredResponse(
            appContextContainer.getContextValue(),
            new BaseError("Config for channel not found"),
          ),
        );
      }

      appContextContainer.set({
        paypalEnv: config.environment,
      });

      return ok(
        new PaymentGatewayInitializeSessionUseCaseResponses.Success({
          pk: config.clientId,
          merchantClientId: config.merchantClientId,
          appContext: appContextContainer.getContextValue(),
        }),
      );
    }

    if (paypalConfigForThisChannel.isErr()) {
      this.logger.error("Failed to get configuration", {
        error: paypalConfigForThisChannel.error,
      });

      return err(
        new BrokenAppResponse(
          appContextContainer.getContextValue(),
          paypalConfigForThisChannel.error,
        ),
      );
    }

    throw new PaymentGatewayInitializeSessionUseCase.UseCaseError("Leaky logic, should not happen");
  }
}
