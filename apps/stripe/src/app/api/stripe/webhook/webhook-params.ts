import { err, ok, Result } from "neverthrow";

import { BaseError } from "@/lib/errors";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";

/**
 * Stores attributes that Stripe webhooks returns to us
 */
export class WebhookParams {
  static saleorApiUrlSearchParam = "saleorApiUrl";

  static ParsingError = BaseError.subclass("ParsingError", {
    props: {
      _type: "WebhookParamsParsingError",
    },
  });

  readonly saleorApiUrl: SaleorApiUrl;

  private constructor(props: { saleorApiUrl: SaleorApiUrl }) {
    this.saleorApiUrl = props.saleorApiUrl;
  }

  private static getSaleorApiUrlOrThrow(searchParams: URLSearchParams) {
    const saleorApiUrlRawString = searchParams.get(WebhookParams.saleorApiUrlSearchParam);

    if (!saleorApiUrlRawString) {
      throw new Error(`Missing ${WebhookParams.saleorApiUrlSearchParam} param`);
    }

    const saleorApiUrlVo = SaleorApiUrl.create({
      url: saleorApiUrlRawString,
    });

    if (saleorApiUrlVo.isErr()) {
      throw new Error(`${WebhookParams.saleorApiUrlSearchParam} is invalid`);
    }

    return saleorApiUrlVo.value;
  }

  static createFromWebhookUrl(
    url: string,
  ): Result<WebhookParams, InstanceType<typeof WebhookParams.ParsingError>> {
    try {
      const { searchParams } = new URL(url);

      // Inner error will be caught by catch and remapped
      const saleorApiUrlVo = this.getSaleorApiUrlOrThrow(searchParams);

      return ok(
        new WebhookParams({
          saleorApiUrl: saleorApiUrlVo,
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
}
