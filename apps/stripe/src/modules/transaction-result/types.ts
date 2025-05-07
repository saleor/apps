import { StripeEnv } from "@/modules/stripe/stripe-env";

export abstract class ResultBase {
  readonly stripeEnv: StripeEnv;

  constructor(stripeEnv: StripeEnv) {
    this.stripeEnv = stripeEnv;
  }
}
