import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { beforeEach, describe, expect, it } from "vitest";

import { mockedConfigurationId, mockedSaleorAppId } from "@/__tests__/mocks/constants";
import { mockedSaleorApiUrl } from "@/__tests__/mocks/saleor-api-url";
import { DynamoMainTable } from "@/modules/dynamodb/dynamo-main-table";
import { createStripeCustomerId } from "@/modules/stripe/stripe-customer-id";

import { DynamoDBStripeCustomerLinkRepo } from "./dynamodb-stripe-customer-link-repo";
import { DynamoDbStripeCustomerLink } from "./stripe-customer-link-db-model";

const access = {
  saleorApiUrl: mockedSaleorApiUrl,
  appId: mockedSaleorAppId,
  configId: mockedConfigurationId,
  saleorUserId: "user-1",
};

const storedItem = {
  PK: `${mockedSaleorApiUrl}#${mockedSaleorAppId}`,
  SK: `STRIPE_CUSTOMER#${mockedConfigurationId}#user-1`,
  _et: "StripeCustomerLink",
  configId: mockedConfigurationId,
  saleorUserId: "user-1",
  stripeCustomerId: "cus_existing",
  createdAt: "2026-01-01T00:00:00.000Z",
  modifiedAt: "2026-01-01T00:00:00.000Z",
};

describe("DynamoDBStripeCustomerLinkRepo", () => {
  const mockDocumentClient = mockClient(DynamoDBDocumentClient);
  let repo: DynamoDBStripeCustomerLinkRepo;

  beforeEach(() => {
    mockDocumentClient.reset();

    const table = DynamoMainTable.create({
      // @ts-expect-error mocking DynamoDBDocumentClient
      documentClient: mockDocumentClient,
      tableName: "stripe-test-table",
    });

    repo = new DynamoDBStripeCustomerLinkRepo({
      entity: DynamoDbStripeCustomerLink.createEntity(table),
    });
  });

  it("Reads a linked Customer ID scoped to the config and user", async () => {
    mockDocumentClient.on(GetCommand).resolvesOnce({ Item: storedItem });

    const result = await repo.getCustomerId(access);

    expect(result._unsafeUnwrap()).toBe("cus_existing");
    expect(mockDocumentClient.commandCalls(GetCommand)[0].args[0].input.Key).toStrictEqual({
      PK: storedItem.PK,
      SK: storedItem.SK,
    });
  });

  it("Returns null when the user has no Customer yet", async () => {
    mockDocumentClient.on(GetCommand).resolvesOnce({});

    expect((await repo.getCustomerId(access))._unsafeUnwrap()).toBeNull();
  });

  it("Saves a link only if none exists", async () => {
    mockDocumentClient.on(PutCommand).resolvesOnce({});

    const result = await repo.saveCustomerId(access, createStripeCustomerId("cus_new"));

    expect(result._unsafeUnwrap()).toBe("cus_new");
    expect(
      mockDocumentClient.commandCalls(PutCommand)[0].args[0].input.ConditionExpression,
    ).toContain("attribute_not_exists");
  });

  it("Returns the existing Customer when another payment linked one first", async () => {
    mockDocumentClient
      .on(PutCommand)
      .rejectsOnce(new ConditionalCheckFailedException({ message: "exists", $metadata: {} }));
    mockDocumentClient.on(GetCommand).resolvesOnce({ Item: storedItem });

    const result = await repo.saveCustomerId(access, createStripeCustomerId("cus_new"));

    expect(result._unsafeUnwrap()).toBe("cus_existing");
  });

  it("Deletes a link", async () => {
    mockDocumentClient.on(DeleteCommand).resolvesOnce({});

    expect((await repo.deleteCustomerId(access))._unsafeUnwrap()).toBeNull();
  });

  it("Returns an error when DynamoDB fails", async () => {
    mockDocumentClient.on(GetCommand).rejectsOnce(new Error("dynamo down"));

    expect((await repo.getCustomerId(access)).isErr()).toBe(true);
  });
});
