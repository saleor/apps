import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { encrypt } from "@saleor/app-sdk/settings-manager";
import { mockClient } from "aws-sdk-client-mock";
import { SavedItem } from "dynamodb-toolbox";
import { beforeEach, describe, expect, it } from "vitest";

import { env } from "@/env";

import { AppConfig } from "../configuration/app-config";
import { DynamoConfigRepository } from "./dynamo-config-repository";
import { SegmentMainTable, SegmentMainTableEntityFactory } from "./segment-main-table";

describe("DynamoConfigRepository", () => {
  const mockDocumentClient = mockClient(DynamoDBDocumentClient);

  const segmentMainTable = SegmentMainTable.create({
    // @ts-expect-error https://github.com/m-radzikowski/aws-sdk-client-mock/issues/197
    documentClient: mockDocumentClient,
    tableName: "segment-test-table",
  });

  const segmentConfigEntity = SegmentMainTableEntityFactory.createConfigEntity(segmentMainTable);

  beforeEach(() => {
    mockDocumentClient.reset();
  });

  it("should successfully get AppConfig from DynamoDB", async () => {
    const mockedConfigEntry: SavedItem<typeof segmentConfigEntity> = {
      PK: "saleorApiUrl#saleorAppId",
      SK: "APP_CONFIG#configKey",
      encryptedSegmentWriteKey: encrypt("encryptedKey", env.SECRET_KEY),
      _et: "Config",
      createdAt: "2023-01-01T00:00:00.000Z",
      modifiedAt: "2023-01-01T00:00:00.000Z",
    };

    mockDocumentClient.on(GetCommand, {}).resolvesOnce({
      Item: mockedConfigEntry,
    });

    const repository = new DynamoConfigRepository();

    const result = await repository.getAppConfigEntry({
      saleorApiUrl: "saleorApiUrl",
      appId: "saleorAppId",
      configKey: "configKey",
    });

    expect(result.isOk()).toBe(true);

    expect(result._unsafeUnwrap()).toBeInstanceOf(AppConfig);
  });

  it("should handle errors when getting AppConfig from DynamoDB", async () => {
    mockDocumentClient.on(GetCommand, {}).rejectsOnce("Exception");

    const repository = new DynamoConfigRepository();

    const result = await repository.getAppConfigEntry({
      saleorApiUrl: "saleorApiUrl",
      appId: "saleorAppId",
      configKey: "configKey",
    });

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(DynamoConfigRepository.GetEntryError);
  });

  it("should return null if AppConfig entry does not exist in DynamoDB", async () => {
    mockDocumentClient.on(GetCommand, {}).resolvesOnce({});

    const repository = new DynamoConfigRepository();

    const result = await repository.getAppConfigEntry({
      saleorApiUrl: "saleorApiUrl",
      appId: "saleorAppId",
      configKey: "configKey",
    });

    expect(result.isOk()).toBe(true);

    expect(result._unsafeUnwrap()).toBeNull();
  });

  it("should successfully set AppConfig entry in DynamoDB", async () => {
    mockDocumentClient.on(PutCommand, {}).resolvesOnce({});

    const repository = new DynamoConfigRepository();

    const result = await repository.setAppConfigEntry({
      saleorApiUrl: "saleorApiUrl",
      appId: "saleorAppId",
      configKey: "configKey",
      config: new AppConfig({
        segmentWriteKey: "segmentWriteKey",
      }),
    });

    expect(result.isOk()).toBe(true);

    expect(result._unsafeUnwrap()).toBe(undefined);
  });

  it("should handle errors when setting AppConfig entry in DynamoDB", async () => {
    mockDocumentClient.on(PutCommand, {}).rejectsOnce("Exception");

    const repository = new DynamoConfigRepository();

    const result = await repository.setAppConfigEntry({
      saleorApiUrl: "saleorApiUrl",
      appId: "saleorAppId",
      configKey: "configKey",
      config: new AppConfig({
        segmentWriteKey: "segmentWriteKey",
      }),
    });

    expect(result.isErr()).toBe(true);

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(DynamoConfigRepository.SetEntryError);
  });
});
