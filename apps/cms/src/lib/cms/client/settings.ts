import { EncryptedMetadataManager } from "@saleor/app-sdk/settings-manager";
import { CMSSchemaChannels, CMSSchemaProviderInstances } from "../config";

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
  productVariantCmsProviderInstances: string[];
}

/**
 * Returns list of provider instances that have to have performed create, update or remove operations against them.
 * The list is based on the channels that the product variant is assigned to and the cms provider instances indicating instances
 * that the product variant has been already created in.
 */
export const getProductVariantProviderInstancesToAlter = async ({
  channelsSettingsParsed,
  productVariantChannels,
  productVariantCmsProviderInstances,
}: ProductVariantProviderInstancesToAlterOpts) => {
  const enabledChannelsForProductVariant = Object.values(channelsSettingsParsed).filter(
    (channelSettings) =>
      !!productVariantChannels.length &&
      !!productVariantChannels.includes(channelSettings.channelSlug)
  );
  const channelsProvidersForProductVariant = enabledChannelsForProductVariant.reduce(
    (acc, channelSettings) => mergeProviderInstances(acc, channelSettings.enabledProviderInstances),
    [] as string[]
  );

  const productVariantCmsKeysNotYetInChannelsSettings = channelsProvidersForProductVariant.filter(
    (cms) => !productVariantCmsProviderInstances.includes(cms)
  );
  const productVariantCmsKeysInChannelsSettings = productVariantCmsProviderInstances.filter((cms) =>
    channelsProvidersForProductVariant.includes(cms)
  );
  const productVariantCmsKeysNoLongerInChannelsSettings = productVariantCmsProviderInstances.filter(
    (cms) => !channelsProvidersForProductVariant.includes(cms)
  );

  return {
    toCreate: productVariantCmsKeysNotYetInChannelsSettings,
    toUpdate: productVariantCmsKeysInChannelsSettings,
    toRemove: productVariantCmsKeysNoLongerInChannelsSettings,
  };
};
