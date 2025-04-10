import {
  buildSyncWebhookResponsePayload,
  SyncWebhookResponsesMap,
} from "@saleor/app-sdk/handlers/shared";
import { err, ok, Result } from "neverthrow";

import {
  PaymentGatewayInitializeResponseShape,
  PaymentGatewayInitializeResponseShapeType,
} from "@/app/api/saleor/payment-gateway-initialize-session/response-shape";
import { BaseError, UseCaseGetConfigError, UseCaseMissingConfigError } from "@/lib/errors";
import { AppConfigRepo } from "@/modules/app-config/app-config-repo";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";

type UseCaseResultShape = SyncWebhookResponsesMap["PAYMENT_GATEWAY_INITIALIZE_SESSION"];

type UseCaseErrorShape =
  | InstanceType<typeof UseCaseMissingConfigError>
  | InstanceType<typeof UseCaseGetConfigError>;

// TODO: shoundn't this be named `PaymentGatewayInitializeSessionUseCase`?
export class InitializeStripeSessionUseCase {
  private appConfigRepo: AppConfigRepo;

  static UseCaseError = BaseError.subclass("InitializeStripeSessionUseCaseError", {
    props: {
      _internalName: "InitializeStripeSessionUseCaseError" as const,
      httpStatusCode: 500,
      httpMessage: "Failed to initialize Stripe session",
    },
  });

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
          new UseCaseMissingConfigError("Config for channel not found", {
            props: {
              channelId,
            },
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
        new UseCaseGetConfigError("Failed to retrieve Publishable Key from config", {
          cause: stripeConfigForThisChannel.error,
        }),
      );
    }

    throw new InitializeStripeSessionUseCase.UseCaseError("Leaky logic, should not happen");
  }
}
