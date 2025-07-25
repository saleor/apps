import { AuthData } from "@saleor/app-sdk/APL";
import { createSaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { ok } from "neverthrow";

import { AppConfigRepo } from "@/modules/app-config/repositories/app-config-repo";
import { StripeClient } from "@/modules/stripe/stripe-client";

export class StripeConnectLinkUseCase {
  private readonly appConfigRepo: AppConfigRepo;

  constructor(deps: { repo: AppConfigRepo }) {
    this.appConfigRepo = deps.repo;
  }

  async execute(params: {
    stripeAccountToConnect: string; // todo value object
    configId: string;
    appBaseUrl: string;
    authData: AuthData;
  }) {
    /*
     * todo how to manage per-channel access?
     * if we have multiple configs / channels, do we need to authorize the account mulitple times?
     */
    const config = await this.appConfigRepo.getStripeConfig({
      configId: params.configId,
      appId: params.authData.appId,
      saleorApiUrl: createSaleorApiUrl(params.authData.saleorApiUrl),
    });

    if (config.isErr()) {
      // todo error handling
      throw new Error(`No config found for configId: ${params.configId}`);
    }

    const stripe = StripeClient.createFromRestrictedKey(config.value!.restrictedKey);

    const accountLink = await stripe.nativeClient.accountLinks.create({
      account: params.stripeAccountToConnect,
      refresh_url: `${params.appBaseUrl}/refresh/${params.stripeAccountToConnect}`,
      return_url: `${params.appBaseUrl}/return/${params.stripeAccountToConnect}`,
      type: "account_onboarding", // todo what is the difference between account_onboarding and account_update?
    });

    return ok(accountLink.url); // todo object response
  }
}
