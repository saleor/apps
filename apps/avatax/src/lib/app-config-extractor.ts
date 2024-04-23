import { MetadataItem } from "../../generated/graphql";
import { err, fromThrowable, ok } from "neverthrow";
import { getAppConfig } from "../modules/app/get-app-config";
import { BaseError } from "../error";
import { AppConfig } from "./app-config";
import { createLogger } from "../logger";

/**
 * Extracts app configuration from metadata. Performs initial validation, shared by all clients
 */
export class AppConfigExtractor {
  static AppConfigExtractorError = BaseError.subclass("AppConfigExtractorError");
  static MissingMetadataError = this.AppConfigExtractorError.subclass("MissingMetadataError");
  static CantResolveAppConfigError = this.AppConfigExtractorError.subclass(
    "CantResolveAppConfigError",
  );
  static LogConfigurationMetricError = this.AppConfigExtractorError.subclass(
    "LogConfigurationMetricError",
  );

  private logger = createLogger("AppConfigExtractor");

  /**
   * Stable interface that resolves config from metadata.
   * Later we can replace internal logic with some better implementations, including DB.
   *
   * It also includes basic error handling and logging
   */
  extractAppConfigFromPrivateMetadata(encryptedPrivateMetadata: MetadataItem[]) {
    if (!encryptedPrivateMetadata.length) {
      return err(
        new AppConfigExtractor.MissingMetadataError(
          "App metadata was not found in Webhook payload. App was likely installed but never configured",
        ),
      );
    }

    const appConfigResult = fromThrowable(getAppConfig, (err) => BaseError.normalize(err))(
      encryptedPrivateMetadata,
    );

    if (appConfigResult.isErr()) {
      this.logger.error("Failed to resolve app configuration", { error: appConfigResult.error });

      return err(
        new AppConfigExtractor.CantResolveAppConfigError("Failed to extract config from metadata", {
          errors: [appConfigResult.error],
        }),
      );
    }

    return ok(AppConfig.createFromParsedConfig(appConfigResult.value));
  }
}
