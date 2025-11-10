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
import { IPayPalPartnerReferralsApi } from "@/modules/paypal/partner-referrals/paypal-partner-referrals-api";
import { createPayPalMerchantId } from "@/modules/paypal/paypal-merchant-id";

import {
  PaymentGatewayInitializeSessionUseCaseResponses,
  PaymentGatewayInitializeSessionUseCaseResponsesType,
} from "./use-case-response";

export class PaymentGatewayInitializeSessionUseCase {
  private paypalConfigRepo: PayPalConfigRepo;
  private paypalPartnerReferralsApiFactory: (config: {
    clientId: string;
    clientSecret: string;
    env: string;
  }) => IPayPalPartnerReferralsApi;
  private logger = createLogger("PaymentGatewayInitializeSessionUseCase");

  static UseCaseError = BaseError.subclass("PaymentGatewayInitializeSessionUseCaseError", {
    props: {
      _internalName: "InitializePayPalSessionUseCaseError" as const,
    },
  });

  constructor(deps: {
    paypalConfigRepo: PayPalConfigRepo;
    paypalPartnerReferralsApiFactory: (config: {
      clientId: string;
      clientSecret: string;
      env: string;
    }) => IPayPalPartnerReferralsApi;
  }) {
    this.paypalConfigRepo = deps.paypalConfigRepo;
    this.paypalPartnerReferralsApiFactory = deps.paypalPartnerReferralsApiFactory;
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

      // Check payment method readiness if merchant ID is available
      let paymentMethodReadiness: {
        applePay: boolean;
        googlePay: boolean;
        paypalButtons: boolean;
        advancedCardProcessing: boolean;
        vaulting: boolean;
      } | undefined;

      if (config.merchantId) {
        try {
          const partnerReferralsApi = this.paypalPartnerReferralsApiFactory({
            clientId: config.clientId,
            clientSecret: config.clientSecret,
            env: config.environment,
          });

          const readinessResult = await partnerReferralsApi.checkPaymentMethodReadiness(
            createPayPalMerchantId(config.merchantId)
          );

          if (readinessResult.isOk()) {
            const readiness = readinessResult.value;
            paymentMethodReadiness = {
              applePay: readiness.applePay,
              googlePay: readiness.googlePay,
              paypalButtons: readiness.paypalButtons,
              advancedCardProcessing: readiness.advancedCardProcessing,
              vaulting: readiness.vaulting,
            };

            this.logger.info("Payment method readiness checked", {
              merchantId: config.merchantId,
              applePay: paymentMethodReadiness.applePay,
              googlePay: paymentMethodReadiness.googlePay,
              paypalButtons: paymentMethodReadiness.paypalButtons,
              advancedCardProcessing: paymentMethodReadiness.advancedCardProcessing,
              vaulting: paymentMethodReadiness.vaulting,
            });
          } else {
            this.logger.warn("Failed to check payment method readiness, continuing without it", {
              merchantId: config.merchantId,
              error: readinessResult.error,
            });
          }
        } catch (error) {
          this.logger.warn("Error checking payment method readiness, continuing without it", {
            merchantId: config.merchantId,
            error,
          });
        }
      }

      return ok(
        new PaymentGatewayInitializeSessionUseCaseResponses.Success({
          pk: config.clientId,
          merchantClientId: config.merchantClientId,
          merchantId: config.merchantId,
          paymentMethodReadiness,
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
