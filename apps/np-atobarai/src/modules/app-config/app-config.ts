import { BaseConfig } from "@saleor/dynamo-config-repository";
import { BaseError } from "@saleor/errors";
import { err, ok, Result } from "neverthrow";
import { z } from "zod";

import { AtobaraiMerchantCode } from "@/modules/atobarai/atobarai-merchant-code";
import { AtobaraiSecretSpCode } from "@/modules/atobarai/atobarai-secret-sp-code";
import { AtobaraiTerminalId } from "@/modules/atobarai/atobarai-terminal-id";

import { AtobaraiShippingCompanyCode } from "../atobarai/atobarai-shipping-company-code";

export type AppChannelConfigFields = {
  readonly name: string;
  readonly id: string;
  readonly shippingCompanyCode: AtobaraiShippingCompanyCode;
  readonly useSandbox: boolean;
  readonly skuAsName: boolean;
  readonly merchantCode: AtobaraiMerchantCode;
  readonly secretSpCode: AtobaraiSecretSpCode;
  readonly terminalId: AtobaraiTerminalId;
};

const schema = z.object({
  id: z.string(),
  merchantCode: z.string(),
  name: z.string(),
  shippingCompanyCode: z.string(),
  skuAsName: z.boolean(),
  secretSpCode: z.string(),
  terminalId: z.string(),
  useSandbox: z.boolean(),
});

export class AppChannelConfig implements AppChannelConfigFields, BaseConfig {
  readonly name: string;
  readonly id: string;
  readonly shippingCompanyCode: AtobaraiShippingCompanyCode;
  readonly useSandbox: boolean;
  readonly skuAsName: boolean;
  readonly merchantCode: AtobaraiMerchantCode;
  readonly secretSpCode: AtobaraiSecretSpCode;
  readonly terminalId: AtobaraiTerminalId;

  static ValidationError = BaseError.subclass("ValidationError", {
    props: {
      _internalName: "AppChannelConfig.ValidationError" as const,
    },
  });

  private constructor(props: AppChannelConfigFields) {
    this.name = props.name;
    this.id = props.id;
    this.useSandbox = props.useSandbox;
    this.terminalId = props.terminalId;
    this.merchantCode = props.merchantCode;
    this.secretSpCode = props.secretSpCode;
    this.shippingCompanyCode = props.shippingCompanyCode;
    this.skuAsName = props.skuAsName;
  }

  private static validate(
    props: AppChannelConfigFields,
  ): Result<null, InstanceType<typeof AppChannelConfig.ValidationError>> {
    try {
      schema.parse(props);

      return ok(null);
    } catch (e) {
      return err(
        new AppChannelConfig.ValidationError("Failed to build config", {
          cause: e,
        }),
      );
    }
  }

  static create(
    args: AppChannelConfigFields,
  ): Result<AppChannelConfig, InstanceType<typeof AppChannelConfig.ValidationError>> {
    return this.validate(args).map(() => new AppChannelConfig(args));
  }
}
