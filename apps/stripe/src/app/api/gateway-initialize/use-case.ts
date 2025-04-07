import {
  buildSyncWebhookResponsePayload,
  SyncWebhookResponsesMap,
} from "@saleor/app-sdk/handlers/shared";
import { err, errAsync, ok, okAsync, Result, ResultAsync } from "neverthrow";

import {
  PaymentGatewayInitializeResponseShape,
  PaymentGatewayInitializeResponseShapeType,
} from "@/app/api/gateway-initialize/response-shape";
import { BaseError } from "@/lib/errors";
import { AppConfigPersistor } from "@/modules/app-config/app-config-persistor";

type UseCaseResultShape = SyncWebhookResponsesMap["PAYMENT_GATEWAY_INITIALIZE_SESSION"];

/*
 * todo test
 * todo errors
 */
export class InitializeStripeSessionUseCase {
  private configPersistor: AppConfigPersistor;

  static UseCaseError = BaseError.subclass("InitializeStripeSessionUseCaseError");
  static MissingConfigError = this.UseCaseError.subclass("MissingConfigError");

  constructor(
    private deps: {
      configPersistor: AppConfigPersistor;
    },
  ) {
    this.configPersistor = deps.configPersistor;
  }

  async execute(params: {
    channelId: string;
    appId: string;
    saleorApiUrl: string;
  }): Promise<Result<UseCaseResultShape, typeof InitializeStripeSessionUseCase.UseCaseError>> {
    const { channelId, appId, saleorApiUrl } = params;

    const stripeConfigForThisChannel = await this.configPersistor.getStripeConfig({
      channelId,
      appId,
      saleorApiUrl,
    });

    return stripeConfigForThisChannel.match(
      (config) => {
        const pk = config?.getPublishableKey();

        if (!pk) {
          return err(
            new InitializeStripeSessionUseCase.MissingConfigError("Config for channel not found", {
              // todo: pass props (channel id), but type safe
            }),
          );
        }

        const rawShape: PaymentGatewayInitializeResponseShapeType = {
          stripePublishableKey: pk.getKeyValue(),
        };

        const responseDataShape = PaymentGatewayInitializeResponseShape.parse(rawShape);

        const validResponseShape =
          buildSyncWebhookResponsePayload<"PAYMENT_GATEWAY_INITIALIZE_SESSION">({
            data: responseDataShape,
          });

        return ok(validResponseShape);
      },
      (error) => {
        return err(
          new InitializeStripeSessionUseCase.UseCaseError(
            "Failed to retrieve Publishable Key from config",
            {
              cause: error,
            },
          ),
        );
      },
    );
  }
}
