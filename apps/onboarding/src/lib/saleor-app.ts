import { type APL, type AuthData } from "@saleor/app-sdk/APL";
import { SaleorApp } from "@saleor/app-sdk/saleor-app";

/**
 * No-op APL: install requests succeed but auth credentials are intentionally dropped.
 *
 * This app is purely client-side — every GraphQL call uses the staff user's JWT issued by
 * AppBridge, so the app server never needs the per-tenant token. We still need an APL to
 * satisfy the SDK contract for the register handler.
 */
class NoopAPL implements APL {
  async get(_saleorApiUrl: string): Promise<AuthData | undefined> {
    return undefined;
  }

  async set(_authData: AuthData): Promise<void> {}

  async delete(_saleorApiUrl: string): Promise<void> {}

  async getAll(): Promise<AuthData[]> {
    return [];
  }

  async isReady(): Promise<{ ready: true } | { ready: false; error: Error }> {
    return { ready: true };
  }

  async isConfigured(): Promise<{ configured: true } | { configured: false; error: Error }> {
    return { configured: true };
  }
}

export const saleorApp = new SaleorApp({
  apl: new NoopAPL(),
});
