import fs from "node:fs";

import { ok, Result } from "neverthrow";
import { z } from "zod";

import { BaseError } from "@/lib/errors";
import { AppRootConfig } from "@/modules/app-config/app-root-config";
import { StripeConfig } from "@/modules/app-config/stripe-config";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { createStripePublishableKey } from "@/modules/stripe/stripe-publishable-key";
import { createStripeRestrictedKey } from "@/modules/stripe/stripe-restricted-key";
import { createStripeWebhookSecret } from "@/modules/stripe/stripe-webhook-secret";

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
    stripeConfigs: z.record(
      z.string({
        description: "Config ID",
      }),
      z.object({
        name: z.string(),
        id: z.string(),
        restrictedKey: z.string(),
        publishableKey: z.string(),
        webhookSecret: z.string(),
      }),
    ),
    channelMapping: z.record(z.string(), z.string()),
  });

  private serializeStripeConfigToJson(config: StripeConfig) {
    return {
      name: config.name,
      id: config.id,
      restrictedKey: config.restrictedKey,
      publishableKey: config.publishableKey,
      webhookSecret: config.webhookSecret,
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
    config: StripeConfig;
    saleorApiUrl: SaleorApiUrl;
    appId: string;
  }) {
    const existingConfigResult = this.readExistingAppConfigFromFileAsJson();

    const newConfig: FileAppConfigRepoSchema = {
      ...existingConfigResult,
      stripeConfigs: {
        ...existingConfigResult.stripeConfigs,
        [args.config.id]: args.config,
      },
    };

    fs.writeFileSync(this.filePath, JSON.stringify(newConfig, null, 2), "utf-8");

    return ok(undefined);
  }

  private createNewFileAndPersistNewAppConfig(args: {
    config: StripeConfig;
    saleorApiUrl: SaleorApiUrl;
    appId: string;
  }) {
    const newConfig: FileAppConfigRepoSchema = {
      stripeConfigs: {
        [args.config.id]: this.serializeStripeConfigToJson(args.config),
      },
      channelMapping: {},
    };

    fs.writeFileSync(this.filePath, JSON.stringify(newConfig, null, 2), "utf-8");

    return ok(undefined);
  }

  async saveStripeConfig(args: {
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
      channelMapping: {},
      stripeConfigs: {},
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

      let resolvedConfig: FileAppConfigRepoSchema["stripeConfigs"][string] | null;

      if ("configId" in access) {
        resolvedConfig =
          Object.entries(existingConfigJson!.stripeConfigs)
            .map(([, config]) => config)
            .find((config) => {
              return config.id === access.configId;
            }) ?? null;
      } else if ("channelId" in access) {
        const configId = existingConfigJson.channelMapping[access.channelId];

        resolvedConfig = existingConfigJson!.stripeConfigs[configId] ?? null;
      } else {
        throw new Error("invariant");
      }

      if (!resolvedConfig) {
        return ok(null);
      }

      const restrictedKey = createStripeRestrictedKey(resolvedConfig.restrictedKey)._unsafeUnwrap();

      const publishableKey = createStripePublishableKey(
        resolvedConfig.publishableKey,
      )._unsafeUnwrap();

      const whSecret = createStripeWebhookSecret(resolvedConfig.webhookSecret)._unsafeUnwrap();

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

    const newConfig = Object.entries(config.stripeConfigs).reduce(
      (accumulator, [configId, oldConfig]) => {
        accumulator.stripeConfigs[configId] =
          oldConfig.id === access.configId
            ? this.serializeStripeConfigToJson(stripeConfig)
            : oldConfig;

        return accumulator;
      },
      { stripeConfigs: {}, channelMapping: {} } as FileAppConfigRepoSchema,
    );

    fs.writeFileSync(this.filePath, JSON.stringify(newConfig, null, 2), "utf-8");

    return ok(null);
  }

  async getRootConfig() {
    const savedJson = this.readExistingAppConfigFromFileAsJson();

    return ok(
      new AppRootConfig(
        savedJson.channelMapping,
        Object.values(savedJson.stripeConfigs).reduce(
          (acc, configJson) => {
            acc[configJson.id] = StripeConfig.create({
              name: configJson.name,
              id: configJson.id,
              publishableKey: createStripePublishableKey(configJson.publishableKey)._unsafeUnwrap(),
              restrictedKey: createStripeRestrictedKey(configJson.restrictedKey)._unsafeUnwrap(),
              webhookSecret: createStripeWebhookSecret(configJson.webhookSecret)._unsafeUnwrap(),
            })._unsafeUnwrap();

            return acc;
          },
          {} as Record<string, StripeConfig>,
        ),
      ),
    );
  }
}
