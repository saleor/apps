import { err, ok, Result } from "neverthrow";

import {
  AppIsNotConfiguredResponse,
  BrokenAppResponse,
} from "@/app/api/webhooks/saleor/saleor-webhook-responses";
import { appContextContainer } from "@/lib/app-context";
import { BaseError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { AppConfigRepo } from "@/modules/app-config/repositories/app-config-repo";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";

import {
  PaymentGatewayInitializeSessionUseCaseResponses,
  PaymentGatewayInitializeSessionUseCaseResponsesType,
} from "./use-case-response";

export class PaymentGatewayInitializeSessionUseCase {
  private appConfigRepo: AppConfigRepo;
  private logger = createLogger("PaymentGatewayInitializeSessionUseCase");

  static UseCaseError = BaseError.subclass("PaymentGatewayInitializeSessionUseCaseError", {
    props: {
      _internalName: "InitializePayPalSessionUseCaseError" as const,
    },
  });

  constructor(deps: { appConfigRepo: AppConfigRepo }) {
    this.appConfigRepo = deps.appConfigRepo;
  }

  async execute(params: {
    channelId: string;
    appId: string;
    saleorApiUrl: SaleorApiUrl;
  }): Promise<
    Result<
      PaymentGatewayInitializeSessionUseCaseResponsesType,
      AppIsNotConfiguredResponse | BrokenAppResponse
    >
  > {
    const { channelId, appId, saleorApiUrl } = params;

    const paypalConfigForThisChannel = await this.appConfigRepo.getPayPalConfig({
      channelId,
      appId,
      saleorApiUrl,
    });

    if (paypalConfigForThisChannel.isOk()) {
      const pk = paypalConfigForThisChannel.value?.clientId;

      if (!pk) {
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
        paypalEnv: paypalConfigForThisChannel.value.getPayPalEnvValue(),
      });

      return ok(
        new PaymentGatewayInitializeSessionUseCaseResponses.Success({
          pk,
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
