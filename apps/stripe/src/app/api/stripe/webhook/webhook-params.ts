import { err, ok, Result } from "neverthrow";

import { BaseError } from "@/lib/errors";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";

/**
 * Stores attributes that Stripe webhooks returns to us
 */
export class WebhookParams {
  static saleorApiUrlSearchParam = "saleorApiUrl";
  static channelIdSearchParam = "channelId";

  static ParsingError = BaseError.subclass("ParsingError", {
    props: {
      _internalName: "WebhookParamsParsingError",
    },
  });

  readonly saleorApiUrl: SaleorApiUrl;
  readonly channelId: string;

  private constructor(props: { saleorApiUrl: SaleorApiUrl; channelId: string }) {
    this.saleorApiUrl = props.saleorApiUrl;
    this.channelId = props.channelId;
  }

  private static getSaleorApiUrlOrThrow(searchParams: URLSearchParams): SaleorApiUrl {
    const saleorApiUrlRawString = searchParams.get(WebhookParams.saleorApiUrlSearchParam);

    if (!saleorApiUrlRawString) {
      throw new BaseError(`Missing ${WebhookParams.saleorApiUrlSearchParam} param`);
    }

    const saleorApiUrlVo = SaleorApiUrl.create({
      url: saleorApiUrlRawString,
    });

    if (saleorApiUrlVo.isErr()) {
      throw new BaseError(`${WebhookParams.saleorApiUrlSearchParam} URL param is invalid`);
    }

    return saleorApiUrlVo.value;
  }

  private static getChannelIdOrThrow(searchParams: URLSearchParams): string {
    const channelId = searchParams.get(this.channelIdSearchParam);

    if (channelId && channelId.length > 0) {
      return channelId;
    }

    throw new BaseError(`${WebhookParams.channelIdSearchParam} URL param is invalid`);
  }

  static createFromWebhookUrl(
    url: string,
  ): Result<WebhookParams, InstanceType<typeof WebhookParams.ParsingError>> {
    try {
      const { searchParams } = new URL(url);

      // Inner error will be caught by catch and remapped
      const saleorApiUrlVo = this.getSaleorApiUrlOrThrow(searchParams);
      const channelId = this.getChannelIdOrThrow(searchParams);

      return ok(
        new WebhookParams({
          saleorApiUrl: saleorApiUrlVo,
          channelId: channelId,
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

  static createFromParams() {
    // todo
  }

  createWebhookUrl() {
    // todo
  }
}
