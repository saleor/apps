import {
  buildSyncWebhookResponsePayload,
  SyncWebhookResponsesMap,
} from "@saleor/app-sdk/handlers/shared";
import { err, ok, Result } from "neverthrow";

import {
  PaymentGatewayInitializeResponseShape,
  PaymentGatewayInitializeResponseShapeType,
} from "@/app/api/saleor/payment-gateway-initialize-session/response-shape";
import { BaseError } from "@/lib/errors";
import { AppConfigRepo } from "@/modules/app-config/app-config-repo";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";

type UseCaseResultShape = SyncWebhookResponsesMap["PAYMENT_GATEWAY_INITIALIZE_SESSION"];

type UseCaseErrorShape = InstanceType<typeof InitializeStripeSessionUseCase.UseCaseError>;

export class InitializeStripeSessionUseCase {
  private appConfigRepo: AppConfigRepo;

  static UseCaseError = BaseError.subclass("InitializeStripeSessionUseCaseError");
  static MissingConfigError = this.UseCaseError.subclass("MissingConfigError");
  static UnhandledError = this.UseCaseError.subclass("UnhandledError");

  constructor(deps: { appConfigRepo: AppConfigRepo }) {
    this.appConfigRepo = deps.appConfigRepo;
  }

  async execute(params: {
    channelId: string;
    appId: string;
    saleorApiUrl: SaleorApiUrl;
  }): Promise<Result<UseCaseResultShape, UseCaseErrorShape>> {
    const { channelId, appId, saleorApiUrl } = params;

    const stripeConfigForThisChannel = await this.appConfigRepo.getStripeConfig({
      channelId,
      appId,
      saleorApiUrl,
    });

    if (stripeConfigForThisChannel.isOk()) {
      const pk = stripeConfigForThisChannel.value?.publishableKey;

      if (!pk) {
        return err(
          new InitializeStripeSessionUseCase.MissingConfigError("Config for channel not found", {
            // todo: pass props (channel id), but type safe
          }),
        );
      }

      const rawShape: PaymentGatewayInitializeResponseShapeType = {
        stripePublishableKey: pk.keyValue,
      };

      const responseDataShape = PaymentGatewayInitializeResponseShape.parse(rawShape);

      const validResponseShape =
        buildSyncWebhookResponsePayload<"PAYMENT_GATEWAY_INITIALIZE_SESSION">({
          data: responseDataShape,
        });

      return ok(validResponseShape);
    }

    if (stripeConfigForThisChannel.isErr()) {
      return err(
        new InitializeStripeSessionUseCase.UseCaseError(
          "Failed to retrieve Publishable Key from config",
          {
            cause: stripeConfigForThisChannel.error,
          },
        ),
      );
    }

    throw new BaseError("Leaky logic, should not happen");
  }
}
