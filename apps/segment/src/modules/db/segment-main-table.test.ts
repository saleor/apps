import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { EntityParser } from "dynamodb-toolbox";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { SegmentMainTable, SegmentMainTableEntityFactory } from "./segment-main-table";

describe("SegmentMainTable", () => {
  const mockDate = new Date("2023-01-01T00:00:00Z");

  beforeAll(() => {
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.resetModules();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  const mockDocumentClient = mockClient(DynamoDBDocumentClient);

  const segmentMainTable = SegmentMainTable.create({
    // @ts-expect-error https://github.com/m-radzikowski/aws-sdk-client-mock/issues/197
    documentClient: mockDocumentClient,
    tableName: "segment-test-table",
  });

  beforeEach(() => {
    mockDocumentClient.reset();
  });

  describe("SegmentAPLEntity", () => {
    it("should create a new entity in DynamoDB with default fields", () => {
      const aplEntity = SegmentMainTableEntityFactory.createAPLEntity(segmentMainTable);

      const parseResult = aplEntity.build(EntityParser).parse({
        PK: "saleorApiUrl",
        SK: "APL",
        token: "appToken",
        saleorApiUrl: "saleorApiUrl",
        appId: "appId",
      });

      expect(parseResult.item).toStrictEqual({
        PK: "saleorApiUrl",
        SK: "APL",
        _et: "APL",
        appId: "appId",
        saleorApiUrl: "saleorApiUrl",
        token: "appToken",
        createdAt: "2023-01-01T00:00:00.000Z",
        modifiedAt: "2023-01-01T00:00:00.000Z",
      });
    });
  });

  describe("SegementConfigEntity", () => {
    it("should create a new entity in DynamoDB with default fields", () => {
      const configEntity = SegmentMainTableEntityFactory.createConfigEntity(segmentMainTable);

      const parseResult = configEntity.build(EntityParser).parse({
        PK: "saleorApiUrl#saleorAppId",
        SK: "APP_CONFIG#configKey",
        encryptedSegmentWriteKey: "key",
      });

      expect(parseResult.item).toStrictEqual({
        PK: "saleorApiUrl#saleorAppId",
        SK: "APP_CONFIG#configKey",
        _et: "Config",
        createdAt: "2023-01-01T00:00:00.000Z",
        modifiedAt: "2023-01-01T00:00:00.000Z",
        encryptedSegmentWriteKey: "key",
      });
    });
  });
});
