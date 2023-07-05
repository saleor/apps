export interface ProviderConfig<T> {
  getProviders(): Array<T>;
  getProviderById(id: string): T | undefined;
}
