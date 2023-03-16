import { CmsOperations } from "../types";
import { ProductVariantProviderInstancesToAlter } from "./settings";

export const getOperationType = ({
  providerInstancesWithRequestedOperation: { toCreate, toUpdate, toRemove },
  providerInstanceId,
}: {
  providerInstancesWithRequestedOperation: ProductVariantProviderInstancesToAlter;
  providerInstanceId: string;
}): keyof CmsOperations => {
  if (toCreate.includes(providerInstanceId)) {
    return "createProduct";
  }
  if (toUpdate.includes(providerInstanceId)) {
    return "updateProduct";
  }
  if (toRemove.includes(providerInstanceId)) {
    return "deleteProduct";
  }

  return "updateProduct";
};
