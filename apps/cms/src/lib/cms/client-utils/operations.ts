import { CmsOperations } from "../types";

export const getOperationType = ({
  providerInstancesWithCreateOperation,
  providerInstancesWithUpdateOperation,
  providerInstancesWithRemoveOperation,
  providerInstanceId,
}: {
  providerInstancesWithCreateOperation: string[];
  providerInstancesWithUpdateOperation: string[];
  providerInstancesWithRemoveOperation: string[];
  providerInstanceId: string;
}): keyof CmsOperations => {
  if (providerInstancesWithCreateOperation.includes(providerInstanceId)) {
    return "createProduct";
  }
  if (providerInstancesWithUpdateOperation.includes(providerInstanceId)) {
    return "updateProduct";
  }
  if (providerInstancesWithRemoveOperation.includes(providerInstanceId)) {
    return "deleteProduct";
  }

  return "updateProduct";
};

export const getEnabledProviderInstancesFromChannelSettingsList = (
  channelSettingsList: {
    enabledProviderInstances: string[];
    channelSlug: string;
  }[]
) => {
  return channelSettingsList.reduce<string[]>((acc, { enabledProviderInstances }) => {
    const moreEnabledProviderInstances = enabledProviderInstances.filter(
      (instance) => acc.indexOf(instance) < 0
    );
    return [...acc, ...moreEnabledProviderInstances];
  }, [] as string[]);
};
