import { StripeConfig } from "@/modules/app-config/stripe-config";

export class AppRootConfig {
  readonly chanelConfigMapping: Record<string, string>;
  readonly stripeConfigsById: Record<string, StripeConfig>;

  constructor(
    chanelConfigMapping: Record<string, string>,
    stripeConfigsById: Record<string, StripeConfig>,
  ) {
    this.chanelConfigMapping = chanelConfigMapping;
    this.stripeConfigsById = stripeConfigsById;
  }

  getAllConfigsAsList() {
    return Object.values(this.stripeConfigsById);
  }
}
