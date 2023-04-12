import { NextWebhookApiHandler } from "@saleor/app-sdk/handlers/next";
import { createSettingsManager } from "../../metadata";
import { getOperationType } from "./operations";
import {
  getChannelsSettings,
  getProductVariantProviderInstancesToAlter,
  getProviderInstancesSettings,
} from "./settings";
import { providersSchemaSet } from "../config";
import { CMSProvider, cmsProviders } from "../providers";
import { CmsClientOperations } from "../types";
import { logger as pinoLogger } from "../../logger";
import { getCmsIdFromSaleorItemKey } from "./metadata";
import { type Client } from "urql";

type WebhookContext = Parameters<NextWebhookApiHandler>["2"];

export const createCmsOperations = async ({
  context,
  client,
  productVariantChannels,
  productVariantCmsKeys,
}: {
  context: Pick<WebhookContext, "authData">;
  client: Client;
  productVariantChannels: string[];
  productVariantCmsKeys: string[];
}) => {
  const logger = pinoLogger.child({
    productVariantChannels,
    productVariantCmsKeys,
  });

  const settingsManager = createSettingsManager(client);

  const [channelsSettingsParsed, providerInstancesSettingsParsed] = await Promise.all([
    getChannelsSettings(settingsManager),
    getProviderInstancesSettings(settingsManager),
  ]);

  const productVariantCmsProviderInstances = productVariantCmsKeys.map((cmsKey) =>
    getCmsIdFromSaleorItemKey(cmsKey)
  );
  const productVariantProviderInstancesToAlter = await getProductVariantProviderInstancesToAlter({
    channelsSettingsParsed,
    productVariantChannels,
    productVariantCmsProviderInstances,
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
