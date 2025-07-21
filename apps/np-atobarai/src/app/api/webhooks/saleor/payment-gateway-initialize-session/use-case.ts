import { SaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { err, ok, Result } from "neverthrow";

import { PaymentGatewayInitializeSessionEventFragment } from "@/generated/graphql";
import { createLogger } from "@/lib/logger";
import { AppConfigRepo } from "@/modules/app-config/repo/app-config-repo";

import { BaseUseCase } from "../base-use-case";
import { AppIsNotConfiguredResponse } from "../saleor-webhook-responses";
import {
  PaymentGatewayInitializeSessionUseCaseResponses,
  PaymentGatewayInitializeSessionUseCaseResponsesType,
} from "./use-case-response";
import {
  MissingBillingAddressError,
  MissingBillingPhoneNumberError,
  MissingEmailError,
  UnsupportedCountryError,
  UnsupportedCurrencyError,
  WrongPhoneNumberFormatError,
} from "./validation-errors";

type UseCaseExecuteResult = Promise<
  Result<PaymentGatewayInitializeSessionUseCaseResponsesType, AppIsNotConfiguredResponse>
>;

export class PaymentGatewayInitializeSessionUseCase extends BaseUseCase {
  protected logger = createLogger("PaymentGatewayInitializeSessionUseCase");
  protected appConfigRepo: Pick<AppConfigRepo, "getChannelConfig">;

  constructor(deps: { appConfigRepo: Pick<AppConfigRepo, "getChannelConfig"> }) {
    super();
    this.appConfigRepo = deps.appConfigRepo;
  }

  async execute(params: {
    appId: string;
    saleorApiUrl: SaleorApiUrl;
    event: PaymentGatewayInitializeSessionEventFragment;
  }): UseCaseExecuteResult {
    const { appId, saleorApiUrl, event } = params;

    const atobaraiConfigResult = await this.getAtobaraiConfigForChannel({
      channelId: event.sourceObject.channel.id,
      appId,
      saleorApiUrl,
    });

    if (atobaraiConfigResult.isErr()) {
      return err(atobaraiConfigResult.error);
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
              publicMessage: `Currency not supported: got ${event.sourceObject.channel.currencyCode} - needs JPY`,
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
              publicMessage: `Shipping address country not supported: got ${event.sourceObject.shippingAddress?.country.code} - needs JP`,
            },
          }),
        ),
      );
    }

    if (!event.sourceObject.billingAddress) {
      this.logger.warn("Missing billing address in event", {
        event,
      });

      return ok(
        new PaymentGatewayInitializeSessionUseCaseResponses.Failure(
          new MissingBillingAddressError("Billing address is required"),
        ),
      );
    }

    if (!event.sourceObject.billingAddress.phone) {
      this.logger.warn("Missing billing phone number in event", {
        event,
      });

      return ok(
        new PaymentGatewayInitializeSessionUseCaseResponses.Failure(
          new MissingBillingPhoneNumberError("Billing phone number is required"),
        ),
      );
    }

    const email =
      event.sourceObject.__typename === "Checkout"
        ? event.sourceObject.email
        : event.sourceObject.userEmail;

    if (!email) {
      this.logger.warn("Missing email in event", {
        event,
      });

      return ok(
        new PaymentGatewayInitializeSessionUseCaseResponses.Failure(
          new MissingEmailError("Email is required"),
        ),
      );
    }

    if (!event.sourceObject.billingAddress.phone.startsWith("+81")) {
      this.logger.warn("Wrong phone number format in event", {
        event,
      });

      return ok(
        new PaymentGatewayInitializeSessionUseCaseResponses.Failure(
          new WrongPhoneNumberFormatError("Wrong phone number format"),
        ),
      );
    }

    return ok(new PaymentGatewayInitializeSessionUseCaseResponses.Success());
  }
}
