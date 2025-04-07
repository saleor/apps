import fs from "node:fs";

import { err, ok, Result } from "neverthrow";
import { z } from "zod";

import { BaseError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { StripeConfig } from "@/modules/app-config/stripe-config";
import { StripePublishableKey } from "@/modules/stripe/stripe-publishable-key";
import { StripeRestrictedKey } from "@/modules/stripe/stripe-restricted-key";

import { AppConfigPersistor } from "./app-config-persistor";

export type FileAppConfigPresistorConfigSchema = z.infer<
  typeof FileAppConfigPresistor.FileConfigSchema
>;

export class FileAppConfigPresistor implements AppConfigPersistor {
  private logger = createLogger("FileAppConfigPresistor");
  private filePath = ".stripe-app-config.json";

  static FileConfigSchema = z.object({
    appRootConfig: z.record(
      z.string(),
      z.object({
        name: z.string(),
        id: z.string(),
        restrictedKey: z.string(),
        publishableKey: z.string(),
      }),
    ),
  });

  static FileReadError = BaseError.subclass("FileReadError");
  static FileWriteError = BaseError.subclass("FileWriteError");
  static JsonParseError = BaseError.subclass("JsonParseError");
  static SchemaParseError = BaseError.subclass("SchemaParseError");
  static ConfigNotFoudError = BaseError.subclass("ConfigNotFoudError");

  private serializeStripeConfigToJson(config: StripeConfig) {
    return {
      name: config.getConfigName(),
      id: config.getConfigId(),
      restrictedKey: config.getRestrictedKey().getKeyValue(),
      publishableKey: config.getPublishableKey().getKeyValue(),
    };
  }

  private readFileSafe = Result.fromThrowable(
    fs.readFileSync,
    (error) => new FileAppConfigPresistor.FileReadError("Error reading file", { cause: error }),
  );

  private jsonParseSafe = Result.fromThrowable(
    JSON.parse,
    (error) =>
      new FileAppConfigPresistor.JsonParseError("Error parsing JSON with config", {
        cause: error,
      }),
  );

  private writeJsonFileSafe = Result.fromThrowable(
    fs.writeFileSync,
    (error) => new FileAppConfigPresistor.FileWriteError("Error writing file", { cause: error }),
  );

  private readExistingAppConfigFromFile() {
    const fileContentResult = this.readFileSafe(this.filePath, "utf-8");

    if (fileContentResult.isErr()) {
      return err(fileContentResult.error);
    }

    const jsonParseResult = this.jsonParseSafe(fileContentResult.value as string);

    if (jsonParseResult.isErr()) {
      return err(jsonParseResult.error);
    }

    const exisitingConfig = FileAppConfigPresistor.FileConfigSchema.safeParse(
      jsonParseResult.value,
    );

    if (!exisitingConfig.success) {
      return err(
        new FileAppConfigPresistor.SchemaParseError("Error parsing schema", {
          cause: exisitingConfig.error,
        }),
      );
    }

    return ok(exisitingConfig.data);
  }

  private persistExistingAppConfig(args: {
    channelId: string;
    config: StripeConfig;
    saleorApiUrl: string;
    appId: string;
  }) {
    const existingConfigResult = this.readExistingAppConfigFromFile();

    if (existingConfigResult.isErr()) {
      return err(existingConfigResult.error);
    }

    const newConfig: z.infer<typeof FileAppConfigPresistor.FileConfigSchema> = {
      appRootConfig: {
        ...existingConfigResult.value.appRootConfig,
        [args.channelId]: this.serializeStripeConfigToJson(args.config),
      },
    };

    const writeResult = this.writeJsonFileSafe(
      this.filePath,
      JSON.stringify(newConfig, null, 2),
      "utf-8",
    );

    if (writeResult.isErr()) {
      return err(writeResult.error);
    }

    return ok(undefined);
  }

  private persistNewAppConfig(args: {
    channelId: string;
    config: StripeConfig;
    saleorApiUrl: string;
    appId: string;
  }) {
    const newConfig = {
      appConfig: {
        [args.channelId]: this.serializeStripeConfigToJson(args.config),
      },
    };

    const writeResult = this.writeJsonFileSafe(
      this.filePath,
      JSON.stringify(newConfig, null, 2),
      "utf-8",
    );

    if (writeResult.isErr()) {
      return err(writeResult.error);
    }

    return ok(undefined);
  }

  async saveStripeConfig(args: {
    channelId: string;
    config: StripeConfig;
    saleorApiUrl: string;
    appId: string;
  }): Promise<Result<void, InstanceType<typeof BaseError>>> {
    if (fs.existsSync(this.filePath)) {
      return this.persistExistingAppConfig(args);
    }

    return this.persistNewAppConfig(args);
  }

  private createFileWithEmptyConfig() {
    const emptyConfig: FileAppConfigPresistorConfigSchema = {
      appRootConfig: {},
    };

    const writeResult = this.writeJsonFileSafe(
      this.filePath,
      JSON.stringify(emptyConfig, null, 2),
      "utf-8",
    );

    if (writeResult.isErr()) {
      return err(writeResult.error);
    }

    return ok(undefined);
  }

  async getStripeConfig(args: {
    channelId: string;
    saleorApiUrl: string;
    appId: string;
  }): Promise<Result<StripeConfig | null, InstanceType<typeof BaseError>>> {
    const existingConfigResult = this.readExistingAppConfigFromFile();

    if (existingConfigResult.isErr()) {
      // if file does not exist, create new one with empty config
      if (existingConfigResult.error instanceof FileAppConfigPresistor.FileReadError) {
        this.createFileWithEmptyConfig();
        this.logger.info("File does not exist, creating new one with empty config.");

        return ok(null);
      }

      return err(existingConfigResult.error);
    }

    const channelConfig = existingConfigResult.value.appRootConfig[args.channelId];

    if (!channelConfig) {
      return err(new FileAppConfigPresistor.ConfigNotFoudError("No config found for channelId"));
    }

    const restrictedKey = StripeRestrictedKey.create({
      restrictedKey: channelConfig.restrictedKey,
    });

    if (restrictedKey.isErr()) {
      return err(restrictedKey.error);
    }

    const publishableKey = StripePublishableKey.create({
      publishableKey: channelConfig.publishableKey,
    });

    if (publishableKey.isErr()) {
      return err(publishableKey.error);
    }

    const stripeConfigResult = StripeConfig.create({
      configName: channelConfig.name,
      configId: channelConfig.id,
      restrictedKeyValue: restrictedKey.value,
      publishableKeyValue: publishableKey.value,
    });

    if (stripeConfigResult.isErr()) {
      return err(stripeConfigResult.error);
    }

    return ok(stripeConfigResult.value);
  }
}
