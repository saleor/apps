import { err, ok, Result } from "neverthrow";
import { z } from "zod";

import { BaseError } from "@/lib/errors";
import { createSaleorApiUrl, SaleorApiUrl } from "@/modules/saleor/saleor-api-url";

/**
 * Stores attributes that Stripe webhook returns to us
 */
export class WebhookParams {
  static saleorApiUrlSearchParam = "saleorApiUrl";
  static configurationIdIdSearchParam = "configurationId";
  static appIdSearchParam = "appId";

  static ParsingError = BaseError.subclass("ParsingError", {
    props: {
      _internalName: "WebhookParamsParsingError",
    },
  });

  readonly saleorApiUrl: SaleorApiUrl;
  readonly configurationId: string;
  /**
   * Require app ID to store a full DynamoDB access path in the webhook URL.
   *
   * If the app is removed, and we still receive the webhook (it's not removed automatically) we will have to somehow disable it.
   * To do that, we need to fetch config from DB. And in DB the path requires saleorApiUrl, appID and configurationId.
   * We must have ALL of them in the webhook to make such a query.
   *
   * We will be also able to recognize if the current app installation is conflicting with the previous one.
   */
  readonly appId: string;

  private constructor(props: {
    saleorApiUrl: SaleorApiUrl;
    configurationId: string;
    appId: string;
  }) {
    this.saleorApiUrl = props.saleorApiUrl;
    this.configurationId = props.configurationId;
    this.appId = props.appId;
  }

  private static getSaleorApiUrlOrThrow(searchParams: URLSearchParams): SaleorApiUrl {
    const saleorApiUrlRawString = searchParams.get(WebhookParams.saleorApiUrlSearchParam);

    if (!saleorApiUrlRawString) {
      throw new BaseError(`Missing ${WebhookParams.saleorApiUrlSearchParam} param`);
    }

    const saleorApiUrlVo = createSaleorApiUrl(saleorApiUrlRawString);

    if (saleorApiUrlVo.isErr()) {
      throw new BaseError(`${WebhookParams.saleorApiUrlSearchParam} URL param is invalid`);
    }

    return saleorApiUrlVo.value;
  }

  private static getConfigurationIdOrThrow(searchParams: URLSearchParams): string {
    const configurationId = searchParams.get(this.configurationIdIdSearchParam);
    const parsedUUID = z.string().uuid().safeParse(configurationId);

    if (parsedUUID.success) {
      return parsedUUID.data;
    }

    throw new BaseError(`${WebhookParams.configurationIdIdSearchParam} URL param is invalid`);
  }

  private static getAppIdOrThrow(searchParams: URLSearchParams): string {
    const configurationId = searchParams.get(this.appIdSearchParam);
    const parsedAppId = z.string().min(3).safeParse(configurationId);

    if (parsedAppId.success) {
      return parsedAppId.data;
    }

    throw new BaseError(`${WebhookParams.appIdSearchParam} URL param is invalid`);
  }

  static createFromWebhookUrl(
    url: string,
  ): Result<WebhookParams, InstanceType<typeof WebhookParams.ParsingError>> {
    try {
      const { searchParams } = new URL(url);

      // Inner error will be caught by catch and remapped
      const saleorApiUrlVo = this.getSaleorApiUrlOrThrow(searchParams);
      const channelId = this.getConfigurationIdOrThrow(searchParams);
      const appId = this.getAppIdOrThrow(searchParams);

      return ok(
        new WebhookParams({
          saleorApiUrl: saleorApiUrlVo,
          configurationId: channelId,
          appId,
        }),
      );
    } catch (error) {
      return err(
        new WebhookParams.ParsingError("Cant parse Stripe incoming webhook URL", {
          cause: error,
          // TODO: Print url but ensure no secrets
        }),
      );
    }
  }

  static createFromParams(params: {
    saleorApiUrl: SaleorApiUrl;
    configurationId: string;
    appId: string;
  }) {
    return new WebhookParams({
      saleorApiUrl: params.saleorApiUrl,
      configurationId: params.configurationId,
      appId: params.appId,
    });
  }
}
