import { EncryptedMetadataManager } from "@saleor/app-sdk/settings-manager";
import { CMSSchemaChannels, CMSSchemaProviderInstances } from "../config";
import { createCmsKeyForSaleorItem } from "./metadata";

export const getChannelsSettings = async (settingsManager: EncryptedMetadataManager) => {
  const channelsSettings = await settingsManager.get("channels");

  try {
    const channelsSettingsParsed =
      (channelsSettings && (JSON.parse(channelsSettings) as CMSSchemaChannels)) || {};

    return channelsSettingsParsed;
  } catch (e) {
    return {};
  }
};

export const getProviderInstancesSettings = async (settingsManager: EncryptedMetadataManager) => {
  const providerInstancesSettings = await settingsManager.get("providerInstances");

  try {
    const providerInstancesSettingsParsed =
      (providerInstancesSettings &&
        (JSON.parse(providerInstancesSettings) as CMSSchemaProviderInstances)) ||
      {};

    return providerInstancesSettingsParsed;
  } catch (e) {
    return {};
  }
};

const filterNotExistingProviderInstances = (
  providerInstances: string[],
  newProviderInstances: string[]
) => {
  return newProviderInstances.filter(
    (newProviderInstance) => !providerInstances.includes(newProviderInstance)
  );
};

const mergeProviderInstances = (providerInstances: string[], newProviderInstances: string[]) => {
  return [
    ...providerInstances,
    ...filterNotExistingProviderInstances(providerInstances, newProviderInstances),
  ];
};

export interface ProductVariantSingleChannelSettings {
  enabledProviderInstances: string[];
  channelSlug: string;
}

export interface ProductVariantProviderInstancesToAlter {
  toCreate: string[];
  toUpdate: string[];
  toRemove: string[];
}

export interface ProductVariantProviderInstancesToAlterOpts {
  channelsSettingsParsed: Record<string, ProductVariantSingleChannelSettings>;
  productVariantChannels: string[];
  productVariantCmsKeys: string[];
}

/**
 * Returns list of provider instances that have to have performed create, update or remove operations against them.
 * The list is based on the channels that the product variant is assigned to and the cms keys indicating provider instances
 * that the product variant has been already created in.
 */
export const getProductVariantProviderInstancesToAlter = async ({
  channelsSettingsParsed,
  productVariantChannels,
  productVariantCmsKeys,
}: ProductVariantProviderInstancesToAlterOpts) => {
  return Object.values(channelsSettingsParsed).reduce<ProductVariantProviderInstancesToAlter>(
    (acc, channelSettings) => {
      const isProductVariantInChannel =
        !!productVariantChannels.length &&
        !!productVariantChannels.includes(channelSettings.channelSlug);

      const isProductVariantInSomeCMS =
        !!productVariantCmsKeys.length &&
        !!channelSettings.enabledProviderInstances.some((providerInstance) =>
          productVariantCmsKeys.includes(createCmsKeyForSaleorItem(providerInstance))
        );

      return {
        toCreate:
          isProductVariantInChannel && !isProductVariantInSomeCMS
            ? mergeProviderInstances(acc.toCreate, channelSettings.enabledProviderInstances)
            : acc.toCreate,
        toUpdate:
          isProductVariantInChannel && isProductVariantInSomeCMS
            ? mergeProviderInstances(acc.toUpdate, channelSettings.enabledProviderInstances)
            : acc.toUpdate,
        toRemove:
          !isProductVariantInChannel && isProductVariantInSomeCMS
            ? mergeProviderInstances(acc.toRemove, channelSettings.enabledProviderInstances)
            : acc.toRemove,
      };
    },
    {
      toCreate: [],
      toUpdate: [],
      toRemove: [],
    } as ProductVariantProviderInstancesToAlter
  );
};
