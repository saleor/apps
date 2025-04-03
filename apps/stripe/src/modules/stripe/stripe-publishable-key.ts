export class StripePublishableKey {
  // TODO: use this to validate the keys on client side
  static testPrefix = "pk_test_";
  static livePrefix = "pk_live_";

  private constructor(private key: string) {}

  static createFromUserInput(args: { publishableKey: string }) {
    return new StripePublishableKey(args.publishableKey);
  }

  getKeyValue() {
    return this.key;
  }
}
