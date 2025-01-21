import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { AuthData } from "@saleor/app-sdk/APL";
import { mockClient } from "aws-sdk-client-mock";
import { SavedItem } from "dynamodb-toolbox";
import { beforeEach, describe, expect, it } from "vitest";

import { DynamoAPLRepository } from "./dynamo-apl-repository";
import { SegmentAPLEntityType } from "./segment-main-table";

describe("DynamoAPLRepository", () => {
  const mockDocumentClient = mockClient(DynamoDBDocumentClient);

  const mockedAuthData: AuthData = {
    appId: "appId",
    saleorApiUrl: "saleorApiUrl",
    token: "appToken",
  };

  beforeEach(() => {
    mockDocumentClient.reset();
  });

  it("should successfully get AuthData entry from DynamoDB", async () => {
    const mockedAPLEntry: SavedItem<SegmentAPLEntityType> = {
      PK: "saleorApiUrl",
      SK: "APL",
      token: "appToken",
      saleorApiUrl: "saleorApiUrl",
      appId: "appId",
      _et: "APL",
      createdAt: "2023-01-01T00:00:00.000Z",
      modifiedAt: "2023-01-01T00:00:00.000Z",
    };

    mockDocumentClient.on(GetCommand, {}).resolvesOnce({
      Item: mockedAPLEntry,
    });

    const repository = new DynamoAPLRepository();

    const result = await repository.getEntry({ saleorApiUrl: "saleorApiUrl" });

    expect(result.isOk()).toBe(true);

    expect(result._unsafeUnwrap()).toStrictEqual({
      appId: "appId",
      domain: undefined,
      jwks: undefined,
      saleorApiUrl: "saleorApiUrl",
      token: "appToken",
    });
  });

  it("should handle errors when getting AuthData from DynamoDB", async () => {
    mockDocumentClient.on(GetCommand, {}).rejectsOnce("Exception");

    const repository = new DynamoAPLRepository();

    const result = await repository.getEntry({ saleorApiUrl: "saleorApiUrl" });

    expect(result.isErr()).toBe(true);

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(DynamoAPLRepository.ReadEntityError);
  });

  it("should return null if AuthData entry does not exist in DynamoDB", async () => {
    mockDocumentClient.on(GetCommand, {}).resolvesOnce({});

    const repository = new DynamoAPLRepository();

    const result = await repository.getEntry({ saleorApiUrl: "saleorApiUrl" });

    expect(result.isOk()).toBe(true);

    expect(result._unsafeUnwrap()).toBe(null);
  });

  it("should successfully set AuthData entry in DynamoDB", async () => {
    mockDocumentClient.on(PutCommand, {}).resolvesOnce({});

    const repository = new DynamoAPLRepository();

    const result = await repository.setEntry({
      authData: mockedAuthData,
    });

    expect(result.isOk()).toBe(true);

    expect(result._unsafeUnwrap()).toBe(undefined);
  });

  it("should handle errors when setting AuthData entry DynamoDB", async () => {
    mockDocumentClient.on(PutCommand, {}).rejectsOnce("Exception");

    const repository = new DynamoAPLRepository();

    const result = await repository.setEntry({
      authData: mockedAuthData,
    });

    expect(result.isErr()).toBe(true);

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(DynamoAPLRepository.WriteEntityError);
  });

  it("should successfully delete AuthData entry from DynamoDB", async () => {
    mockDocumentClient.on(DeleteCommand, {}).resolvesOnce({});

    const repository = new DynamoAPLRepository();

    const result = await repository.deleteEntry({ saleorApiUrl: "saleorApiUrl" });

    expect(result.isOk()).toBe(true);

    expect(result._unsafeUnwrap()).toBe(undefined);
  });

  it("should handle errors when deleting AuthData entry from DynamoDB", async () => {
    mockDocumentClient.on(DeleteCommand, {}).rejectsOnce("Exception");

    const repository = new DynamoAPLRepository();

    const result = await repository.deleteEntry({ saleorApiUrl: "saleorApiUrl" });

    expect(result.isErr()).toBe(true);

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(DynamoAPLRepository.DeleteEntityError);
  });

  it("should successfully get all AuthData entries from DynamoDB", async () => {
    const mockedAPLEntries: SavedItem<SegmentAPLEntityType>[] = [
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

    const repository = new DynamoAPLRepository();

    const result = await repository.getAllEntries();

    expect(result.isOk()).toBe(true);

    expect(result._unsafeUnwrap()).toStrictEqual([
      {
        appId: "appId",
        domain: undefined,
        jwks: undefined,
        saleorApiUrl: "saleorApiUrl",
        token: "appToken",
      },
      {
        appId: "newAppId",
        domain: undefined,
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

    const repository = new DynamoAPLRepository();

    const result = await repository.getAllEntries();

    expect(result.isOk()).toBe(true);

    expect(result._unsafeUnwrap()).toBe(null);
  });

  it("should handle error when getting all AuthData entries from DynamoDB", async () => {
    mockDocumentClient.on(ScanCommand, {}).rejectsOnce("Exception");

    const repository = new DynamoAPLRepository();

    const result = await repository.getAllEntries();

    expect(result.isErr()).toBe(true);

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(DynamoAPLRepository.ScanEntityError);
  });
});
