export interface DbVariantsStorage {
  setDirtyVariant(variantId: string): Promise<void>;
  getDirtyVariants(
    access: { saleorApiUrl: string; appId: string },
    limit: number,
  ): Promise<string[]>;
}
