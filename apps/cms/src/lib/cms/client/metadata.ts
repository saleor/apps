import { CMS_ID_KEY } from "../config";

type MetadataItem = Record<string, any> & { key: string; value: string };

export const getCmsKeysFromSaleorItem = (item?: { metadata: MetadataItem[] } | null) => {
  return (
    item?.metadata.filter((item) => item.key.startsWith(CMS_ID_KEY)).map((item) => item.key) || []
  );
};

export const createCmsKeyForSaleorItem = (cmsProviderInstanceId: string) => {
  return `${CMS_ID_KEY}_${cmsProviderInstanceId}`;
};

export const getCmsIdFromSaleorItemKey = (key: string) => {
  return key.split("_")[1];
};

export const getCmsIdFromSaleorItem = (
  item: Record<string, any> & { metadata: MetadataItem[] },
  cmsProviderInstanceId: string
) =>
  item.metadata.find((item) => item.key === createCmsKeyForSaleorItem(cmsProviderInstanceId))
    ?.value;
