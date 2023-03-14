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
  channelsToUpdate?: string[] | null;
  cmsKeysToUpdate?: string[] | null;
}

export const getProductVariantProviderInstancesToAlter = async ({
  channelsSettingsParsed,
  channelsToUpdate,
  cmsKeysToUpdate,
}: ProductVariantProviderInstancesToAlterOpts) => {
  return Object.values(channelsSettingsParsed).reduce<ProductVariantProviderInstancesToAlter>(
    (acc, channelSettings) => {
      const productVariantEnabledProviderInstances =
        channelSettings.enabledProviderInstances.filter((providerInstance) =>
          cmsKeysToUpdate?.includes(createCmsKeyForSaleorItem(providerInstance))
        );

      const isProductVariantInChannel = !!channelsToUpdate?.includes(channelSettings.channelSlug);
      const isProductVariantInSomeCMS = !!(
        cmsKeysToUpdate?.length && !!productVariantEnabledProviderInstances.length
      );

      return {
        toCreate:
          isProductVariantInChannel && !isProductVariantInSomeCMS
            ? mergeProviderInstances(acc.toCreate, productVariantEnabledProviderInstances)
            : acc.toCreate,
        toUpdate:
          isProductVariantInChannel && isProductVariantInSomeCMS
            ? mergeProviderInstances(acc.toUpdate, productVariantEnabledProviderInstances)
            : acc.toUpdate,
        toRemove:
          !isProductVariantInChannel && isProductVariantInSomeCMS
            ? mergeProviderInstances(acc.toRemove, productVariantEnabledProviderInstances)
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
