import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { SmtpConfig } from "./smtp-config-schema";
import { fromAsyncThrowable, fromThrowable, ok, okAsync, Result, ResultAsync } from "neverthrow";
import { BaseError } from "../../../errors";

export class SmtpMetadataManager {
  private metadataKey = "smtp-config";

  static SmtpMetadataManagerError = BaseError.subclass("SmtpMetadataManagerError");
  static ParseConfigError = this.SmtpMetadataManagerError.subclass("ParseConfigError");
  static SetConfigError = this.SmtpMetadataManagerError.subclass("SetConfigError");
  static FetchConfigError = this.SmtpMetadataManagerError.subclass("FetchConfigError");

  constructor(
    private metadataManager: SettingsManager,
    private saleorApiUrl: string,
  ) {}

  getConfig(): ResultAsync<
    SmtpConfig | undefined,
    InstanceType<
      typeof SmtpMetadataManager.ParseConfigError | typeof SmtpMetadataManager.FetchConfigError
    >
  > {
    return fromAsyncThrowable(
      this.metadataManager.get,
      SmtpMetadataManager.FetchConfigError.normalize,
    )(this.metadataKey, this.saleorApiUrl).andThen((config) => {
      if (!config) {
        return ok(undefined);
      }

      return fromThrowable(JSON.parse, SmtpMetadataManager.ParseConfigError.normalize)(config);
    });
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
