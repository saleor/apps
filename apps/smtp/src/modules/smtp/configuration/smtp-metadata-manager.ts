import { SettingsManager } from "@saleor/app-sdk/settings-manager";
import { fromPromise, fromThrowable, ok, ResultAsync } from "neverthrow";

import { BaseError } from "../../../errors";
import { racePromise } from "../../../lib/race-promise";
import { createLogger } from "../../../logger";
import { SmtpConfig } from "./smtp-config-schema";

const PULL_CONFG_TIMEOUT = 3000;

// todo test
export class SmtpMetadataManager {
  private metadataKey = "smtp-config";
  private logger = createLogger("SmtpMetadataManager");

  static SmtpMetadataManagerError = BaseError.subclass("SmtpMetadataManagerError");
  static ParseConfigError = this.SmtpMetadataManagerError.subclass("ParseConfigError");
  static SetConfigError = this.SmtpMetadataManagerError.subclass("SetConfigError");
  static FetchConfigError = this.SmtpMetadataManagerError.subclass("FetchConfigError");
  static TimeoutExceededError = this.SmtpMetadataManagerError.subclass("TimeoutExceededError");

  constructor(
    private metadataManager: SettingsManager,
    private saleorApiUrl: string,
    private pullConfigTimeout = PULL_CONFG_TIMEOUT,
  ) {}

  getConfig(): ResultAsync<
    SmtpConfig | undefined,
    InstanceType<
      typeof SmtpMetadataManager.ParseConfigError | typeof SmtpMetadataManager.FetchConfigError
    >
  > {
    this.logger.debug("Fetching SMTP config");

    const timeoutedPromise = racePromise({
      promise: this.metadataManager.get(this.metadataKey, this.saleorApiUrl),
      timeout: this.pullConfigTimeout,
      error: new SmtpMetadataManager.TimeoutExceededError("Timeout while fetching metadata"),
    });

    return fromPromise(timeoutedPromise, (e) => {
      this.logger.debug("Failed to fetch config", { error: e });

      return new SmtpMetadataManager.FetchConfigError("Failed to fetch metadata", { errors: [e] });
    }).andThen((config) => {
      if (!config) {
        this.logger.debug("Config not found, returning undefined");

        return ok(undefined);
      }

      this.logger.debug("Config found, will parse JSON now");

      return fromThrowable(JSON.parse, SmtpMetadataManager.ParseConfigError.normalize)(config);
    });
  }

  setConfig(
    config: SmtpConfig,
  ): ResultAsync<void, InstanceType<typeof SmtpMetadataManager.SetConfigError>> {
    this.logger.debug("Trying to set config");

    return ResultAsync.fromPromise(
      this.metadataManager.set({
        key: this.metadataKey,
        value: JSON.stringify(config),
        domain: this.saleorApiUrl,
      }),
      SmtpMetadataManager.SetConfigError.normalize,
    );
  }
}
