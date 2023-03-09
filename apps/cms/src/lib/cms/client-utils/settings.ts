import { EncryptedMetadataManager } from "@saleor/app-sdk/settings-manager";
import { CMSSchemaChannels, CMSSchemaProviderInstances } from "../config";
import { createCmsKeyForSaleorItem } from "./metadata";

export const getChannelsSettings = async (settingsManager: EncryptedMetadataManager) => {
  const channelsSettings = await settingsManager.get("channels");
  console.log("channelsSettings", channelsSettings);
  const channelsSettingsParsed =
    (channelsSettings && (JSON.parse(channelsSettings) as CMSSchemaChannels)) || {};

  return channelsSettingsParsed;
};

export const getProviderInstancesSettings = async (settingsManager: EncryptedMetadataManager) => {
  const providerInstancesSettings = await settingsManager.get("providerInstances");
  console.log("providerInstancesSettings", providerInstancesSettings);
  const providerInstancesSettingsParsed =
    (providerInstancesSettings &&
      (JSON.parse(providerInstancesSettings) as CMSSchemaProviderInstances)) ||
    {};

  return providerInstancesSettingsParsed;
};

export const getProductVariantChannelsSettings = async ({
  channelsSettingsParsed,
  channelsToUpdate,
  cmsKeysToUpdate,
}: {
  channelsSettingsParsed: Record<
    string,
    {
      enabledProviderInstances: string[];
      channelSlug: string;
    }
  >;
  channelsToUpdate?: string[] | null;
  cmsKeysToUpdate?: string[] | null;
}) => {
  return Object.values(channelsSettingsParsed).reduce<{
    toCreate: {
      enabledProviderInstances: string[];
      channelSlug: string;
    }[];
    toUpdate: {
      enabledProviderInstances: string[];
      channelSlug: string;
    }[];
    toRemove: {
      enabledProviderInstances: string[];
      channelSlug: string;
    }[];
  }>(
    (acc, channelSettings) => {
      const isProductVariantInChannel = !!channelsToUpdate?.includes(channelSettings.channelSlug);
      const isProductVariantInSomeCMS = !!(
        cmsKeysToUpdate?.length &&
        channelSettings.enabledProviderInstances.find((key) =>
          cmsKeysToUpdate.includes(createCmsKeyForSaleorItem(key))
        )
      );

      return {
        toCreate:
          isProductVariantInChannel && !isProductVariantInSomeCMS
            ? [...acc.toCreate, channelSettings]
            : acc.toCreate,
        toUpdate:
          isProductVariantInChannel && isProductVariantInSomeCMS
            ? [...acc.toUpdate, channelSettings]
            : acc.toUpdate,
        toRemove:
          !isProductVariantInChannel && isProductVariantInSomeCMS
            ? [...acc.toRemove, channelSettings]
            : acc.toRemove,
      };
    },
    {
      toCreate: [],
      toUpdate: [],
      toRemove: [],
    }
  );
};
