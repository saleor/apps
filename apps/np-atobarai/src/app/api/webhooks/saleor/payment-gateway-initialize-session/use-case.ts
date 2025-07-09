import { SaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { err, ok } from "neverthrow";

import { PaymentGatewayInitializeSessionEventFragment } from "@/generated/graphql";
import { createLogger } from "@/lib/logger";
import { AppConfigRepo } from "@/modules/app-config/types";

import { AppIsNotConfiguredResponse } from "../saleor-webhook-responses";
import {
  PaymentGatewayInitializeSessionUseCaseResponses,
  UnsupportedCountryError,
  UnsupportedCurrencyError,
} from "./use-case-response";

export class PaymentGatewayInitializeSessionUseCase {
  private appConfigRepo: AppConfigRepo;
  private logger = createLogger("PaymentGatewayInitializeSessionUseCase");

  constructor(deps: { appConfigRepo: AppConfigRepo }) {
    this.appConfigRepo = deps.appConfigRepo;
  }

  async execute(params: {
    appId: string;
    saleorApiUrl: SaleorApiUrl;
    event: PaymentGatewayInitializeSessionEventFragment;
  }) {
    const { appId, saleorApiUrl, event } = params;

    const atobaraiConfigForThisChannel = await this.appConfigRepo.getAtobaraiConfig({
      channelId: event.sourceObject.channel.id,
      appId,
      saleorApiUrl,
    });

    if (atobaraiConfigForThisChannel.isErr()) {
      this.logger.error("Failed to get configuration", {
        error: atobaraiConfigForThisChannel.error,
      });

      return err(new AppIsNotConfiguredResponse(atobaraiConfigForThisChannel.error));
    }

    if (event.sourceObject.channel.currencyCode !== "JPY") {
      this.logger.warn("Unsupported currency", {
        channelId: event.sourceObject.channel.id,
        currencyCode: event.sourceObject.channel.currencyCode,
      });

      return ok(
        new PaymentGatewayInitializeSessionUseCaseResponses.Failure(
          new UnsupportedCurrencyError("Unsupported currency", {
            props: {
              publicMessage: `Currency not supported - got ${event.sourceObject.channel.currencyCode} - needs JPY`,
            },
          }),
        ),
      );
    }

    if (event.sourceObject.shippingAddress?.country.code !== "JP") {
      this.logger.warn("Unsupported shipping address country", {
        channelId: event.sourceObject.channel.id,
        countryCode: event.sourceObject.shippingAddress?.country.code,
      });

      return ok(
        new PaymentGatewayInitializeSessionUseCaseResponses.Failure(
          new UnsupportedCountryError("Unsupported shipping address country", {
            props: {
              publicMessage: `Shipping address country not supported - got ${event.sourceObject.shippingAddress?.country.code} - needs JP`,
            },
          }),
        ),
      );
    }

    return ok(new PaymentGatewayInitializeSessionUseCaseResponses.Success());
  }
}
