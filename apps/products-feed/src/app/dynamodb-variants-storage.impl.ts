import { DbVariantsStorage } from "./dynamodb-variants-storage";

export class DynamodbVariantsStorageImpl implements DbVariantsStorage {
  setDirtyVariant(variantId: string): Promise<void> {}

  getDirtyVariants(
    access: { saleorApiUrl: string; appId: string },
    limit?: number,
  ): Promise<string[]> {}
}
