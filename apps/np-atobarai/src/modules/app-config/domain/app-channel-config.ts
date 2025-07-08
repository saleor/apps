import { ok, Result } from "neverthrow";

import { BaseError } from "@/lib/errors";

type RawProps = {
  readonly name: string;
  readonly id: string;
  readonly shippingCompanyCode: string;
  readonly useSandbox: boolean;
  readonly fillMissingAddress: boolean;
  readonly skuAsName: boolean;
  readonly merchantCode: string;
  readonly spCode: string;
  readonly terminalId: string;
};

export class AppChannelConfig implements RawProps {
  readonly name: string;
  readonly id: string;
  readonly shippingCompanyCode: string;
  readonly useSandbox: boolean;
  readonly fillMissingAddress: boolean;
  readonly skuAsName: boolean;
  readonly merchantCode: string;
  readonly spCode: string;
  readonly terminalId: string;

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

  static validate(
    props: RawProps,
  ): Result<null, InstanceType<typeof AppChannelConfig.ValidationError>> {
    // todo validate
    return ok(null);
  }

  static create(
    args: RawProps,
  ): Result<AppChannelConfig, InstanceType<typeof AppChannelConfig.ValidationError>> {
    return this.validate(args).map(() => new AppChannelConfig(args));
  }
}
