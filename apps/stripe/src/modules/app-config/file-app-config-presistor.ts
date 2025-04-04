import fs from "node:fs";

import { err, ok, Result } from "neverthrow";
import { z } from "zod";

import { BaseError } from "@/lib/errors";
import { StripeConfig } from "@/modules/app-config/stripe-config";

import { AppConfigPresistor } from "./app-config-persistor";

export class FileAppConfigPresistor implements AppConfigPresistor {
  private filePath = ".stripe-app-config.json";

  private static appConfigSchema = z.object({
    appConfig: z.record(
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

    const exisitingConfig = FileAppConfigPresistor.appConfigSchema.safeParse(jsonParseResult.value);

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

    const newConfig: z.infer<typeof FileAppConfigPresistor.appConfigSchema> = {
      appConfig: {
        ...existingConfigResult.value.appConfig,
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

  async persistStripeConfig(args: {
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

  async retrieveStripeConfig(args: {
    channelId: string;
    saleorApiUrl: string;
    appId: string;
  }): Promise<Result<StripeConfig, InstanceType<typeof BaseError>>> {
    const existingConfigResult = this.readExistingAppConfigFromFile();

    if (existingConfigResult.isErr()) {
      return err(existingConfigResult.error);
    }

    const channelConfig = existingConfigResult.value.appConfig[args.channelId];

    if (!channelConfig) {
      return err(new FileAppConfigPresistor.ConfigNotFoudError("No config found for channelId"));
    }

    const stripeConfigResult = StripeConfig.createFromPersistedData({
      configName: channelConfig.name,
      configId: channelConfig.id,
      restrictedKeyValue: channelConfig.restrictedKey,
      publishableKeyValue: channelConfig.publishableKey,
    });

    if (stripeConfigResult.isErr()) {
      return err(stripeConfigResult.error);
    }

    return ok(stripeConfigResult.value);
  }
}
