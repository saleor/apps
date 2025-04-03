export class StripeRestrictedKey {
  // TODO: use this to validate the keys on client side
  static testPrefix = "rk_test_";
  static livePrefix = "rk_live_";

  private constructor(private key: string) {}

  static createFromUserInput(args: { restrictedKey: string }) {
    return new StripeRestrictedKey(args.restrictedKey);
  }

  isValid() {
    // TODO: check if in current implementation we can use restricted keys - preivously we couldn't
    return false;
  }

  getKeyValue() {
    return this.key;
  }
}
