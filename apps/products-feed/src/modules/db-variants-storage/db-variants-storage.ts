export type AccessPattern = { saleorApiUrl: string; appId: string };

export interface DbVariantsStorage {
  setDirtyVariant(access: AccessPattern, variantId: string): Promise<void>;
  getDirtyVariants(access: AccessPattern, limit: number): Promise<string[]>;
  clearDirtyVariants(access: AccessPattern, variantIds: string[]): Promise<void>;
}
