import { err, ok, type Result, ResultAsync } from "neverthrow";
import Stripe from "stripe";

import { StripeClient } from "@/modules/stripe/stripe-client";

import { type StripeRestrictedKey } from "./stripe-restricted-key";
import { type CreateCustomerArgs, type IStripeCustomersApi } from "./types";

/**
 * Never created - only used to ask Stripe whether the key may write Customers.
 */
const PERMISSION_PROBE_CUSTOMER_ID = "cus_saleor_app_permission_probe";

export class StripeCustomersApi implements IStripeCustomersApi {
  private stripeApiWrapper: Pick<Stripe, "customers">;

  private constructor(stripeApiWrapper: Pick<Stripe, "customers">) {
    this.stripeApiWrapper = stripeApiWrapper;
  }

  static createFromKey(args: { key: StripeRestrictedKey }) {
    return new StripeCustomersApi(StripeClient.createFromRestrictedKey(args.key).nativeClient);
  }

  static createFromClient(client: StripeClient) {
    return new StripeCustomersApi(client.nativeClient);
  }

  async createCustomer(args: CreateCustomerArgs): Promise<Result<Stripe.Customer, unknown>> {
    return ResultAsync.fromPromise(
      this.stripeApiWrapper.customers.create(
        { ...args.params, metadata: args.metadata },
        { idempotencyKey: args.idempotencyKey },
      ),
      (error) => error,
    );
  }

  /**
   * Restricted keys can't be asked for their scopes. Updating a Customer that doesn't exist tells
   * the cases apart without side effects: Stripe checks the key's permissions before it looks the
   * Customer up, so a key without Customers - Write gets a permission error and any other key gets
   * "resource missing".
   */
  async hasCustomersWritePermission(): Promise<Result<boolean, unknown>> {
    try {
      await this.stripeApiWrapper.customers.update(PERMISSION_PROBE_CUSTOMER_ID, {});

      return ok(true);
    } catch (error) {
      if (error instanceof Stripe.errors.StripePermissionError) {
        return ok(false);
      }

      if (
        error instanceof Stripe.errors.StripeInvalidRequestError &&
        error.code === "resource_missing"
      ) {
        return ok(true);
      }

      return err(error);
    }
  }
}
