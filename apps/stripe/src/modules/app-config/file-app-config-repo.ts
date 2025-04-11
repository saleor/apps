import fs from "node:fs";

import { ok, Result } from "neverthrow";
import { z } from "zod";

import { BaseError } from "@/lib/errors";
import { StripeConfig } from "@/modules/app-config/stripe-config";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { StripePublishableKey } from "@/modules/stripe/stripe-publishable-key";
import { StripeRestrictedKey } from "@/modules/stripe/stripe-restricted-key";
import { StripeWebhookSecret } from "@/modules/stripe/stripe-webhook-secret";

import { AppConfigRepo, GetStripeConfigAccessPattern } from "./app-config-repo";

export type FileAppConfigRepoSchema = z.infer<typeof FileAppConfigRepo.FileConfigSchema>;

/**
 * Save / read app configuration from a JSON file (`.stripe-app-config.json`).
 * If file with configuration doesn't exist it will create a new one with empty config that you need to fill in.
 *
 * It will be removed. Lack of error handling is intentional
 */
export class FileAppConfigRepo implements AppConfigRepo {
  private filePath = ".stripe-app-config.json";

  static FileConfigSchema = z.object({
    appRootConfig: z.record(
      z.string(),
      z.object({
        name: z.string(),
        id: z.string(),
        restrictedKey: z.string(),
        publishableKey: z.string(),
        webhookSecret: z.string(),
      }),
    ),
  });

  static FileWriteError = BaseError.subclass("FileWriteError");
  static JsonParseError = BaseError.subclass("JsonParseError");
  static SchemaParseError = BaseError.subclass("SchemaParseError");

  private serializeStripeConfigToJson(config: StripeConfig) {
    return {
      name: config.name,
      id: config.id,
      restrictedKey: config.restrictedKey.keyValue,
      publishableKey: config.publishableKey.keyValue,
      webhookSecret: config.webhookSecret.secretValue,
    };
  }

  private readExistingAppConfigFromFileAsJson() {
    try {
      const fileContentResult = fs.readFileSync(this.filePath, "utf-8");

      const jsonParseResult = JSON.parse(fileContentResult as string);

      const existingConfig = FileAppConfigRepo.FileConfigSchema.parse(jsonParseResult);

      return existingConfig;
    } catch (e) {
      throw new BaseError("Failed reading file from disk, check config", {
        cause: e,
      });
    }
  }

  private saveNewConfigToFile(args: {
    channelId: string;
    config: StripeConfig;
    saleorApiUrl: SaleorApiUrl;
    appId: string;
  }) {
    const existingConfigResult = this.readExistingAppConfigFromFileAsJson();

    const newConfig: z.infer<typeof FileAppConfigRepo.FileConfigSchema> = {
      appRootConfig: {
        ...existingConfigResult.appRootConfig,
        [args.channelId]: this.serializeStripeConfigToJson(args.config),
      },
    };

    fs.writeFileSync(this.filePath, JSON.stringify(newConfig, null, 2), "utf-8");

    return ok(undefined);
  }

  private createNewFileAndPersistNewAppConfig(args: {
    channelId: string;
    config: StripeConfig;
    saleorApiUrl: SaleorApiUrl;
    appId: string;
  }) {
    const newConfig = {
      appConfig: {
        [args.channelId]: this.serializeStripeConfigToJson(args.config),
      },
    };

    fs.writeFileSync(this.filePath, JSON.stringify(newConfig, null, 2), "utf-8");

    return ok(undefined);
  }

  async saveStripeConfig(args: {
    channelId: string;
    config: StripeConfig;
    saleorApiUrl: SaleorApiUrl;
    appId: string;
  }): Promise<Result<void, InstanceType<typeof BaseError>>> {
    if (fs.existsSync(this.filePath)) {
      return this.saveNewConfigToFile(args);
    }

    return this.createNewFileAndPersistNewAppConfig(args);
  }

  private createFileWithEmptyConfig() {
    const emptyConfig: FileAppConfigRepoSchema = {
      appRootConfig: {},
    };

    fs.writeFileSync(this.filePath, JSON.stringify(emptyConfig, null, 2), "utf-8");

    return ok(undefined);
  }

  async getStripeConfig(
    access: GetStripeConfigAccessPattern,
  ): Promise<Result<StripeConfig | null, InstanceType<typeof BaseError>>> {
    try {
      let existingConfigJson: FileAppConfigRepoSchema | null = null;

      try {
        existingConfigJson = this.readExistingAppConfigFromFileAsJson();
      } catch {
        this.createFileWithEmptyConfig();

        return ok(null);
      }

      let resolvedConfig: FileAppConfigRepoSchema["appRootConfig"][string] | null;

      if ("configId" in access) {
        resolvedConfig =
          Object.entries(existingConfigJson!.appRootConfig)
            .map(([, config]) => config)
            .find((config) => {
              return config.id === access.configId;
            }) ?? null;
      } else if ("channelId" in access) {
        resolvedConfig = existingConfigJson!.appRootConfig[access.channelId] ?? null;
      } else {
        throw new Error("invariant");
      }

      if (!resolvedConfig) {
        return ok(null);
      }

      const restrictedKey = StripeRestrictedKey.create({
        restrictedKey: resolvedConfig.restrictedKey,
      })._unsafeUnwrap();

      const publishableKey = StripePublishableKey.create({
        publishableKey: resolvedConfig.publishableKey,
      })._unsafeUnwrap();

      const whSecret = StripeWebhookSecret.create(resolvedConfig.webhookSecret)._unsafeUnwrap();

      const stripeConfig = StripeConfig.create({
        name: resolvedConfig.name,
        id: resolvedConfig.id,
        restrictedKey: restrictedKey,
        publishableKey: publishableKey,
        webhookSecret: whSecret,
      })._unsafeUnwrap();

      return ok(stripeConfig);
    } catch (e) {
      throw new BaseError("Something is wrong with local file config", {
        cause: e,
      });
    }
  }

  async updateStripeConfig(
    access: {
      configId: string;
      saleorApiUrl: SaleorApiUrl;
      appId: string;
    },
    stripeConfig: StripeConfig,
  ) {
    const config = this.readExistingAppConfigFromFileAsJson();

    const newConfig = Object.entries(config.appRootConfig).reduce(
      (accumulator, [channelId, oldConfig]) => {
        accumulator.appRootConfig[channelId] =
          oldConfig.id === access.configId
            ? this.serializeStripeConfigToJson(stripeConfig)
            : oldConfig;

        return accumulator;
      },
      { appRootConfig: {} } as FileAppConfigRepoSchema,
    );

    fs.writeFileSync(this.filePath, JSON.stringify(newConfig, null, 2), "utf-8");

    return ok(null);
  }
}
