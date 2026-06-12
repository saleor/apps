import type { APL, AuthData } from "@saleor/app-sdk/APL";

/**
 * Anonymizer has no backend that needs to call Saleor outside of the request that
 * carries its own auth, so it doesn't need to persist auth data via an APL.
 *
 * This NoopAPL satisfies the App SDK's APL interface without storing anything.
 * Reads always return "not found" and writes are discarded.
 */
export class NoopAPL implements APL {
  async get(_saleorApiUrl: string): Promise<AuthData | undefined> {
    return undefined;
  }

  async set(_authData: AuthData): Promise<void> {
    return undefined;
  }

  async delete(_saleorApiUrl: string): Promise<void> {
    return undefined;
  }

  async getAll(): Promise<AuthData[]> {
    return [];
  }

  async isReady() {
    return { ready: true } as const;
  }

  async isConfigured() {
    return { configured: true } as const;
  }
}
