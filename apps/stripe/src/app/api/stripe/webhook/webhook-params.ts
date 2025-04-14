import { err, ok, Result } from "neverthrow";
import { z } from "zod";

import { BaseError } from "@/lib/errors";
import { createSaleorApiUrl, SaleorApiUrlType } from "@/modules/saleor/saleor-api-url";

/**
 * Stores attributes that Stripe webhooks returns to us
 */
export class WebhookParams {
  static saleorApiUrlSearchParam = "saleorApiUrl";
  static configurationIdIdSearchParam = "configurationId";

  static ParsingError = BaseError.subclass("ParsingError", {
    props: {
      _internalName: "WebhookParamsParsingError",
    },
  });

  readonly saleorApiUrl: SaleorApiUrlType;
  readonly configurationId: string;

  private constructor(props: { saleorApiUrl: SaleorApiUrlType; configurationId: string }) {
    this.saleorApiUrl = props.saleorApiUrl;
    this.configurationId = props.configurationId;
  }

  private static getSaleorApiUrlOrThrow(searchParams: URLSearchParams): SaleorApiUrlType {
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

  static createFromWebhookUrl(
    url: string,
  ): Result<WebhookParams, InstanceType<typeof WebhookParams.ParsingError>> {
    try {
      const { searchParams } = new URL(url);

      // Inner error will be caught by catch and remapped
      const saleorApiUrlVo = this.getSaleorApiUrlOrThrow(searchParams);
      const channelId = this.getConfigurationIdOrThrow(searchParams);

      return ok(
        new WebhookParams({
          saleorApiUrl: saleorApiUrlVo,
          configurationId: channelId,
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
