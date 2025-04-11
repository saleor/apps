import { err, ok, Result } from "neverthrow";

import { BaseError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { AppConfigRepo } from "@/modules/app-config/app-config-repo";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import {
  GetConfigErrorResponse,
  MissingConfigErrorResponse,
} from "@/modules/saleor/saleor-webhook-responses";

import {
  PaymentGatewayInitializeResponseDataShape,
  PaymentGatewayInitializeResponseDataShapeType,
} from "./response-data-shape";
import {
  PaymentGatewayInitializeSessionUseCaseResponses,
  PaymentGatewayInitializeSessionUseCaseResponsesType,
} from "./use-case-response";

export class PaymentGatewayInitializeSessionUseCase {
  private appConfigRepo: AppConfigRepo;
  private logger = createLogger("PaymentGatewayInitializeSessionUseCase");

  static UseCaseError = BaseError.subclass("PaymentGatewayInitializeSessionUseCaseError", {
    props: {
      _internalName: "InitializeStripeSessionUseCaseError" as const,
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
      MissingConfigErrorResponse | GetConfigErrorResponse
    >
  > {
    const { channelId, appId, saleorApiUrl } = params;

    const stripeConfigForThisChannel = await this.appConfigRepo.getStripeConfig({
      channelId,
      appId,
      saleorApiUrl,
    });

    if (stripeConfigForThisChannel.isOk()) {
      const pk = stripeConfigForThisChannel.value?.publishableKey;

      if (!pk) {
        this.logger.warn("Config for channel not found", {
          channelId,
        });

        return err(new MissingConfigErrorResponse());
      }

      const rawShape: PaymentGatewayInitializeResponseDataShapeType = {
        stripePublishableKey: pk.keyValue,
      };

      const responseData = PaymentGatewayInitializeResponseDataShape.parse(rawShape);

      return ok(
        new PaymentGatewayInitializeSessionUseCaseResponses.Success({
          responseData,
        }),
      );
    }

    if (stripeConfigForThisChannel.isErr()) {
      this.logger.error("Failed to get configuration", {
        error: stripeConfigForThisChannel.error,
      });

      return err(new GetConfigErrorResponse());
    }

    throw new PaymentGatewayInitializeSessionUseCase.UseCaseError("Leaky logic, should not happen");
  }
}
