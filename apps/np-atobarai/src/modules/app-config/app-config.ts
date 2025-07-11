import { BaseError } from "@saleor/errors";
import { err, ok, Result } from "neverthrow";
import { z } from "zod";

import { AtobaraiMerchantCode } from "@/modules/atobarai/atobarai-merchant-code";
import { AtobaraiSpCode } from "@/modules/atobarai/atobarai-sp-code";
import { AtobaraiTerminalId } from "@/modules/atobarai/atobarai-terminal-id";

type RawProps = {
  readonly name: string;
  readonly id: string;
  // todo make value object / enum
  readonly shippingCompanyCode: string;
  readonly useSandbox: boolean;
  readonly fillMissingAddress: boolean;
  readonly skuAsName: boolean;
  readonly merchantCode: AtobaraiMerchantCode;
  readonly spCode: AtobaraiSpCode;
  readonly terminalId: AtobaraiTerminalId;
};

// todo export subset of schema for public validation in frontend
const schema = z.object({
  fillMissingAddress: z.boolean(),
  id: z.string(),
  merchantCode: z.string(),
  name: z.string(),
  shippingCompanyCode: z.string(),
  skuAsName: z.boolean(),
  spCode: z.string(),
  terminalId: z.string(),
  useSandbox: z.boolean(),
});

export class AppChannelConfig implements RawProps {
  readonly name: string;
  readonly id: string;
  readonly shippingCompanyCode: string;
  readonly useSandbox: boolean;
  readonly fillMissingAddress: boolean;
  readonly skuAsName: boolean;
  readonly merchantCode: AtobaraiMerchantCode;
  readonly spCode: AtobaraiSpCode;
  readonly terminalId: AtobaraiTerminalId;

  static ValidationError = BaseError.subclass("ValidationError", {
    props: {
      _internalName: "AppChannelConfig.ValidationError" as const,
    },
  });

  private constructor(props: RawProps) {
    this.name = props.name;
    this.id = props.id;
    this.fillMissingAddress = props.fillMissingAddress;
    this.useSandbox = props.useSandbox;
    this.terminalId = props.terminalId;
    this.merchantCode = props.merchantCode;
    this.spCode = props.spCode;
    this.shippingCompanyCode = props.shippingCompanyCode;
    this.skuAsName = props.skuAsName;
  }

  private static validate(
    props: RawProps,
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
    args: RawProps,
  ): Result<AppChannelConfig, InstanceType<typeof AppChannelConfig.ValidationError>> {
    return this.validate(args).map(() => new AppChannelConfig(args));
  }
}

export class AppRootConfig {
  readonly chanelConfigMapping: Record<string, string>;
  readonly configsById: Record<string, AppChannelConfig>;

  constructor(
    chanelConfigMapping: Record<string, string>,
    configsById: Record<string, AppChannelConfig>,
  ) {
    this.chanelConfigMapping = chanelConfigMapping;
    this.configsById = configsById;
  }

  getAllConfigsAsList() {
    return Object.values(this.configsById);
  }

  getChannelsBoundToGivenConfig(configId: string) {
    const keyValues = Object.entries(this.chanelConfigMapping);
    const filtered = keyValues.filter(([_, value]) => value === configId);

    return filtered.map(([channelId]) => channelId);
  }
}
