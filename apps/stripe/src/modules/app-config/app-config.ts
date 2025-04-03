import { StripePublishableKey } from "@/modules/stripe/stripe-publishable-key";
import { StripeSecretKey } from "@/modules/stripe/stripe-restriced-key";

export class AppConfig {
  getStripeSecretKey(): StripeSecretKey {}
  getStripePublishableKey(): StripePublishableKey {}
}
