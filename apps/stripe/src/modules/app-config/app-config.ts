import { env } from "@/lib/env";

interface AppConfigStorage {
  getSecretKeyValue(): string;
  getPublishableKeyValue(): string;
}

export class EnvAppConfigStorage implements AppConfigStorage {
  getSecretKeyValue(): string {
    return env.STRIPE_SECRET_KEY;
  }
  getPublishableKeyValue(): string {
    return env.STRIPE_PUBLISHABLE_KEY;
  }
}

export class AppConfig {
  constructor(private deps: { storage: AppConfigStorage }) {}
  getStripeSecretKeyValue(): string {
    return this.deps.storage.getSecretKeyValue();
  }
  getStripePublishableKey(): string {
    return this.deps.storage.getPublishableKeyValue();
  }
}
