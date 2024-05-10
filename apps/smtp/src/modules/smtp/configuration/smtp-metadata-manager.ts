import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { SmtpConfig } from "./smtp-config-schema";
import { fromThrowable, ok, okAsync, Result, ResultAsync } from "neverthrow";
import { BaseError } from "../../../errors";

export class SmtpMetadataManager {
  private metadataKey = "smtp-config";

  static SmtpMetadataManagerError = BaseError.subclass("SmtpMetadataManagerError");
  static ParseConfigError = this.SmtpMetadataManagerError.subclass("ParseConfigError");
  static SetConfigError = this.SmtpMetadataManagerError.subclass("SetConfigError");

  constructor(
    private metadataManager: SettingsManager,
    private saleorApiUrl: string,
  ) {}

  async getConfig(): Promise<
    Result<SmtpConfig | undefined, InstanceType<typeof SmtpMetadataManager.ParseConfigError>>
  > {
    const rawConfig = await this.metadataManager.get(this.metadataKey, this.saleorApiUrl);

    if (!rawConfig) {
      return ok(undefined);
    }

    return fromThrowable(JSON.parse, SmtpMetadataManager.ParseConfigError.normalize)(rawConfig);
  }

  setConfig(
    config: SmtpConfig,
  ): ResultAsync<void, InstanceType<typeof SmtpMetadataManager.SetConfigError>> {
    return ResultAsync.fromThrowable(
      this.metadataManager.set,
      SmtpMetadataManager.SetConfigError.normalize,
    )({
      key: this.metadataKey,
      value: JSON.stringify(config),
      domain: this.saleorApiUrl,
    });
  }
}
