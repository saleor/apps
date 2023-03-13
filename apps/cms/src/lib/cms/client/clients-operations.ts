import { NextWebhookApiHandler } from "@saleor/app-sdk/handlers/next";
import { createClient } from "../../graphql";
import { createSettingsManager } from "../../metadata";
import { getOperationType } from "./operations";
import {
  getChannelsSettings,
  getProviderInstancesSettings,
  getProductVariantProviderInstancesToAlter,
} from "./settings";
import { providersSchemaSet } from "../config";
import cmsProviders, { CMSProvider } from "../providers";
import { CmsClientOperations } from "../types";
import { logger as pinoLogger } from "../../logger";

type WebhookContext = Parameters<NextWebhookApiHandler>["2"];

// todo: add support for multiple providers at once
export const createCmsOperations = async ({
  context,
  channelsToUpdate,
  cmsKeysToUpdate,
}: {
  context: WebhookContext;
  channelsToUpdate?: string[] | null;
  cmsKeysToUpdate?: string[] | null;
}) => {
  const logger = pinoLogger.child({
    channelsToUpdate,
    cmsKeysToUpdate,
  });

  const saleorApiUrl = context.authData.saleorApiUrl;
  const token = context.authData.token;

  const client = createClient(saleorApiUrl, async () => ({
    token: token,
  }));

  const settingsManager = createSettingsManager(client);

  const channelsSettingsParsed = await getChannelsSettings(settingsManager);
  const providerInstancesSettingsParsed = await getProviderInstancesSettings(settingsManager);

  const productVariantProviderInstancesToAlter = await getProductVariantProviderInstancesToAlter({
    channelsSettingsParsed,
    channelsToUpdate,
    cmsKeysToUpdate,
  });

  const allProductVariantProviderInstancesToAlter = [
    ...productVariantProviderInstancesToAlter.toCreate,
    ...productVariantProviderInstancesToAlter.toUpdate,
    ...productVariantProviderInstancesToAlter.toRemove,
  ];

  if (!allProductVariantProviderInstancesToAlter.length) {
    // todo: use instead: throw new Error("The channel settings were not found.");
    // continue with other provider instances
    return [];
  }

  const enabledProviderInstancesSettings = Object.values(providerInstancesSettingsParsed).filter(
    (providerInstance) => allProductVariantProviderInstancesToAlter.includes(providerInstance.id)
  );

  const clientsOperations = enabledProviderInstancesSettings.reduce<CmsClientOperations[]>(
    (acc, providerInstanceSettings) => {
      const provider = cmsProviders[
        providerInstanceSettings.providerName as CMSProvider
      ] as (typeof cmsProviders)[keyof typeof cmsProviders];

      const validation =
        providersSchemaSet[providerInstanceSettings.providerName as CMSProvider].safeParse(
          providerInstanceSettings
        );

      if (!validation.success) {
        // todo: use instead: throw new Error(validation.error.message);
        // continue with other provider instances
        logger.error("The provider instance settings validation failed.", {
          error: validation.error.message,
        });

        return acc;
      }

      const config = validation.data;

      if (provider) {
        return [
          ...acc,
          {
            cmsProviderInstanceId: providerInstanceSettings.id,
            // todo: fix validation to not pass config as any
            operations: provider.create(config as any), // config without validation = providerInstanceSettings as any
            operationType: getOperationType({
              providerInstancesWithRequestedOperation: productVariantProviderInstancesToAlter,
              providerInstanceId: providerInstanceSettings.id,
            }),
          },
        ];
      }
      return acc;
    },
    [] as CmsClientOperations[]
  );

  return clientsOperations;
};
