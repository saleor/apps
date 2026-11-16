import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import { DeleteItemCommand, GetItemCommand, PutItemCommand } from "dynamodb-toolbox";
import { err, ok, type Result } from "neverthrow";

import { createLogger } from "@/lib/logger";
import { createStripeCustomerId, type StripeCustomerId } from "@/modules/stripe/stripe-customer-id";
import {
  type StripeCustomerLinkAccess,
  type StripeCustomerLinkRepo,
  StripeCustomerLinkRepoError,
} from "@/modules/stripe-customers/repositories/stripe-customer-link-repo";

import {
  DynamoDbStripeCustomerLink,
  type DynamoDbStripeCustomerLinkEntity,
} from "./stripe-customer-link-db-model";

const toKey = (access: StripeCustomerLinkAccess) => ({
  PK: DynamoDbStripeCustomerLink.accessPattern.getPK(access),
  SK: DynamoDbStripeCustomerLink.accessPattern.getSKforSpecificItem(access),
});

export class DynamoDBStripeCustomerLinkRepo implements StripeCustomerLinkRepo {
  private entity: DynamoDbStripeCustomerLinkEntity;

  private logger = createLogger("DynamoDBStripeCustomerLinkRepo");

  constructor(params = { entity: DynamoDbStripeCustomerLink.entity }) {
    this.entity = params.entity;
  }

  async getCustomerId(
    access: StripeCustomerLinkAccess,
  ): Promise<Result<StripeCustomerId | null, StripeCustomerLinkRepoError>> {
    try {
      const result = await this.entity.build(GetItemCommand).key(toKey(access)).send();

      return ok(result.Item ? createStripeCustomerId(result.Item.stripeCustomerId) : null);
    } catch (e) {
      return err(
        new StripeCustomerLinkRepoError("Failed to read Stripe Customer link from DynamoDB", {
          cause: e,
        }),
      );
    }
  }

  async saveCustomerId(
    access: StripeCustomerLinkAccess,
    customerId: StripeCustomerId,
  ): Promise<Result<StripeCustomerId, StripeCustomerLinkRepoError>> {
    try {
      await this.entity
        .build(PutItemCommand)
        .item({
          ...toKey(access),
          configId: access.configId,
          saleorUserId: access.saleorUserId,
          stripeCustomerId: customerId,
        })
        .options({ condition: { attr: "stripeCustomerId", exists: false } })
        .send();

      return ok(customerId);
    } catch (e) {
      /*
       * Another payment of the same user linked a Customer first. Using that one keeps the user on a
       * single Customer.
       * ponytail: the Customer this payment created stays unused in Stripe; clean up if it matters.
       */
      if (e instanceof ConditionalCheckFailedException) {
        this.logger.info("Stripe Customer already linked, using the existing link");

        return (await this.getCustomerId(access)).andThen((existing) =>
          existing
            ? ok(existing)
            : err(
                new StripeCustomerLinkRepoError("Stripe Customer link disappeared after conflict"),
              ),
        );
      }

      return err(
        new StripeCustomerLinkRepoError("Failed to write Stripe Customer link to DynamoDB", {
          cause: e,
        }),
      );
    }
  }

  async deleteCustomerId(
    access: StripeCustomerLinkAccess,
  ): Promise<Result<null, StripeCustomerLinkRepoError>> {
    try {
      await this.entity.build(DeleteItemCommand).key(toKey(access)).send();

      return ok(null);
    } catch (e) {
      return err(
        new StripeCustomerLinkRepoError("Failed to delete Stripe Customer link from DynamoDB", {
          cause: e,
        }),
      );
    }
  }
}
