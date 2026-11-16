import { err, ok, type Result } from "neverthrow";
import Stripe from "stripe";

import { type StripeCustomerSourceFragment } from "@/generated/graphql";
import { BaseError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { type SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { mapStripeErrorToApiError, StripePermissionError } from "@/modules/stripe/stripe-api-error";
import { createStripeCustomerId, type StripeCustomerId } from "@/modules/stripe/stripe-customer-id";
import { type IStripeCustomersApi } from "@/modules/stripe/types";
import {
  type StripeCustomerLinkAccess,
  type StripeCustomerLinkRepo,
} from "@/modules/stripe-customers/repositories/stripe-customer-link-repo";

import { resolveStripeCustomerDetails } from "./stripe-customer-details";

export const StripeCustomerResolverError = {
  PermissionDenied: BaseError.subclass("StripeCustomerResolver.PermissionDeniedError", {
    props: {
      _internalName: "StripeCustomerResolver.PermissionDeniedError" as const,
    },
  }),
  Failed: BaseError.subclass("StripeCustomerResolver.FailedError", {
    props: {
      _internalName: "StripeCustomerResolver.FailedError" as const,
    },
  }),
};

export type StripeCustomerResolverError = InstanceType<
  typeof StripeCustomerResolverError.PermissionDenied | typeof StripeCustomerResolverError.Failed
>;

export type ResolvedStripeCustomer = {
  customerId: StripeCustomerId;
  paymentShipping: Stripe.PaymentIntentCreateParams.Shipping | undefined;
  /** Lets the app drop a link to a Customer deleted in Stripe. */
  link: StripeCustomerLinkAccess;
};

/**
 * Finds or creates the Stripe Customer for a signed-in buyer, following ADR 0005. Guests get no
 * Customer, so Stripe groups their payments as guest customers. Customers are never matched by
 * email - it is not verified.
 */
export class StripeCustomerResolver {
  private logger = createLogger("StripeCustomerResolver");
  private linkRepo: StripeCustomerLinkRepo;

  constructor(deps: { linkRepo: StripeCustomerLinkRepo }) {
    this.linkRepo = deps.linkRepo;
  }

  async resolve(args: {
    source: StripeCustomerSourceFragment;
    customersApi: IStripeCustomersApi;
    saleorApiUrl: SaleorApiUrl;
    appId: string;
    configId: string;
    idempotencyKey: string;
  }): Promise<Result<ResolvedStripeCustomer | null, StripeCustomerResolverError>> {
    const user = args.source.user;

    if (!user) {
      return ok(null);
    }

    const { customer, paymentShipping } = resolveStripeCustomerDetails(args.source);
    const link: StripeCustomerLinkAccess = {
      saleorApiUrl: args.saleorApiUrl,
      appId: args.appId,
      configId: args.configId,
      saleorUserId: user.id,
    };

    const existing = await this.linkRepo.getCustomerId(link);

    if (existing.isErr()) {
      return err(
        new StripeCustomerResolverError.Failed("Failed to read Stripe Customer link", {
          cause: existing.error,
        }),
      );
    }

    if (existing.value) {
      return ok({ customerId: existing.value, paymentShipping, link });
    }

    const created = await args.customersApi.createCustomer({
      params: customer,
      metadata: { saleor_api_url: args.saleorApiUrl, saleor_user_id: user.id },
      /*
       * The Payment Intent already uses the raw key, and Stripe rejects one key on two endpoints.
       * Retried webhooks get the same Customer back instead of a duplicate.
       */
      idempotencyKey: `${args.idempotencyKey}:customer`,
    });

    if (created.isErr()) {
      const apiError = mapStripeErrorToApiError(created.error);

      if (apiError instanceof StripePermissionError) {
        return err(
          new StripeCustomerResolverError.PermissionDenied(
            "Restricted key can't create Stripe Customers",
            { cause: apiError },
          ),
        );
      }

      return err(
        new StripeCustomerResolverError.Failed("Failed to create Stripe Customer", {
          cause: apiError,
        }),
      );
    }

    const customerId = createStripeCustomerId(created.value.id);
    const saved = await this.linkRepo.saveCustomerId(link, customerId);

    if (saved.isErr()) {
      /*
       * The Customer exists, so this payment still gets it. The next payment creates another one,
       * which beats failing the payment.
       */
      this.logger.warn("Failed to save Stripe Customer link", { error: saved.error });

      return ok({ customerId, paymentShipping, link });
    }

    return ok({ customerId: saved.value, paymentShipping, link });
  }

  /**
   * Drops the link to a Customer deleted in Stripe. The next payment creates a new Customer.
   */
  forgetCustomer(link: StripeCustomerLinkAccess) {
    return this.linkRepo.deleteCustomerId(link);
  }
}

/**
 * Payment Intent creation failed because the linked Customer was deleted in Stripe.
 */
export const isMissingStripeCustomerError = (error: unknown) =>
  error instanceof Stripe.errors.StripeInvalidRequestError &&
  error.code === "resource_missing" &&
  error.param === "customer";
