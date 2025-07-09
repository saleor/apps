import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { rootLogger } from "@saleor/apps-logger";
import { mockClient } from "aws-sdk-client-mock";
import { SavedItem, Table } from "dynamodb-toolbox";
import { beforeEach, describe, expect, it } from "vitest";

import { createAplEntity, DynamoDbAplEntity, PartitionKey, SortKey } from "./apl-db-model";
import { DynamoAPLRepository } from "./dynamo-apl-repository";
import { mockedAuthData } from "./mocks/mocked-auth-data";

class TestTable extends Table<PartitionKey, SortKey> {
  private constructor(args: ConstructorParameters<typeof Table<PartitionKey, SortKey>>[number]) {
    super(args);
  }

  static create({
    documentClient,
    tableName,
  }: {
    documentClient: DynamoDBDocumentClient;
    tableName: string;
  }): TestTable {
    return new TestTable({
      documentClient,
      name: tableName,
      partitionKey: { name: "PK", type: "string" },
      sortKey: {
        name: "SK",
        type: "string",
      },
    });
  }
}

describe("DynamoAPLRepository", () => {
  const mockDocumentClient = mockClient(DynamoDBDocumentClient);

  const table = TestTable.create({
    // @ts-expect-error problem with types of stub
    documentClient: mockDocumentClient,
    tableName: "test-table",
  });

  let repository = new DynamoAPLRepository({
    entity: createAplEntity(table),
    logger: rootLogger,
  });

  beforeEach(() => {
    mockDocumentClient.reset();

    repository = new DynamoAPLRepository({
      entity: createAplEntity(table),
      logger: rootLogger,
    });
  });

  it("should successfully get AuthData entry from DynamoDB", async () => {
    const mockedAPLEntry: SavedItem<DynamoDbAplEntity> = {
      SK: "APL",
      PK: mockedAuthData.saleorApiUrl,
      token: mockedAuthData.token,
      saleorApiUrl: mockedAuthData.saleorApiUrl,
      appId: mockedAuthData.appId,
      _et: "APL",
      createdAt: "2023-01-01T00:00:00.000Z",
      modifiedAt: "2023-01-01T00:00:00.000Z",
    };

    mockDocumentClient.on(GetCommand, {}).resolvesOnce({
      Item: mockedAPLEntry,
    });

    const result = await repository.getEntry({ saleorApiUrl: mockedAuthData.saleorApiUrl });

    expect(result).toStrictEqual({
      jwks: undefined,
      token: mockedAuthData.token,
      saleorApiUrl: mockedAuthData.saleorApiUrl,
      appId: mockedAuthData.appId,
    });
  });

  it("should handle errors when getting AuthData from DynamoDB", async () => {
    mockDocumentClient.on(GetCommand, {}).rejectsOnce("Exception");

    await expect(() =>
      repository.getEntry({ saleorApiUrl: mockedAuthData.saleorApiUrl }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: Exception]`);
  });

  it("should return null if AuthData entry does not exist in DynamoDB", async () => {
    mockDocumentClient.on(GetCommand, {}).resolvesOnce({});

    const result = await repository.getEntry({ saleorApiUrl: mockedAuthData.saleorApiUrl });

    expect(result).toBe(null);
  });

  it("should successfully set AuthData entry in DynamoDB", async () => {
    mockDocumentClient.on(PutCommand, {}).resolvesOnce({});

    const result = await repository.setEntry({
      authData: mockedAuthData,
    });

    expect(result).toBe(undefined);
  });

  it("should handle errors when setting AuthData entry DynamoDB", async () => {
    mockDocumentClient.on(PutCommand, {}).rejectsOnce("Exception");

    return expect(() =>
      repository.setEntry({
        authData: mockedAuthData,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: Exception]`);
  });

  it("should successfully delete AuthData entry from DynamoDB", async () => {
    mockDocumentClient.on(DeleteCommand, {}).resolvesOnce({});

    const result = await repository.deleteEntry({ saleorApiUrl: mockedAuthData.saleorApiUrl });

    expect(result).toBe(undefined);
  });

  it("should handle errors when deleting AuthData entry from DynamoDB", async () => {
    mockDocumentClient.on(DeleteCommand, {}).rejectsOnce("Exception");

    return expect(() =>
      repository.deleteEntry({ saleorApiUrl: mockedAuthData.saleorApiUrl }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: Exception]`);
  });

  it("should successfully get all AuthData entries from DynamoDB", async () => {
    const mockedAPLEntries: SavedItem<DynamoDbAplEntity>[] = [
      {
        PK: "saleorApiUrl",
        SK: "APL",
        token: "appToken",
        saleorApiUrl: "saleorApiUrl",
        appId: "appId",
        _et: "APL",
        createdAt: "2023-01-01T00:00:00.000Z",
        modifiedAt: "2023-01-01T00:00:00.000Z",
      },
      {
        PK: "additionalSaleorApiUrl",
        SK: "APL",
        token: "newAppToken",
        saleorApiUrl: "additionalSaleorApiUrl",
        appId: "newAppId",
        _et: "APL",
        createdAt: "2024-01-01T00:00:00.000Z",
        modifiedAt: "2024-01-01T00:00:00.000Z",
      },
    ];

    mockDocumentClient.on(ScanCommand, {}).resolvesOnce({
      Items: mockedAPLEntries,
    });

    const result = await repository.getAllEntries();

    expect(result).toStrictEqual([
      {
        appId: "appId",
        jwks: undefined,
        saleorApiUrl: "saleorApiUrl",
        token: "appToken",
      },
      {
        appId: "newAppId",
        jwks: undefined,
        saleorApiUrl: "additionalSaleorApiUrl",
        token: "newAppToken",
      },
    ]);
  });

  it("should return null if there are no AuthData entries in DynamoDB", async () => {
    mockDocumentClient.on(ScanCommand, {}).resolvesOnce({
      Items: [],
    });

    const result = await repository.getAllEntries();

    expect(result).toBe(null);
  });

  it("should handle error when getting all AuthData entries from DynamoDB", async () => {
    mockDocumentClient.on(ScanCommand, {}).rejectsOnce("Exception");

    return expect(() => repository.getAllEntries()).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: Exception]`,
    );
  });
});
