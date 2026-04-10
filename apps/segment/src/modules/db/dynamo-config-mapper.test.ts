import { encrypt } from "@saleor/app-sdk/settings-manager";
import { type Logger } from "@saleor/apps-logger";
import { type FormattedItem } from "dynamodb-toolbox";
import { describe, expect, it, vi } from "vitest";

import { AppConfig } from "../configuration/app-config";
import { DynamoConfigMapper } from "./dynamo-config-mapper";
import { type SegmentConfigEntityType } from "./segment-main-table";

const createMockLogger = () =>
  ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }) as unknown as Logger;

describe("DynamoConfigMapper", () => {
  const encryptionKey = "encryptionKey";

  it("should map DynamoDB entity to AppConfig", () => {
    const mapper = new DynamoConfigMapper({
      encryptionKey,
      logger: createMockLogger(),
    });

    const entity: FormattedItem<SegmentConfigEntityType> = {
      PK: "saleorApiUrl#saleorAppId",
      SK: "APP_CONFIG#configKey",
      encryptedSegmentWriteKey: encrypt("encryptedKey", encryptionKey),
      createdAt: "2023-01-01T00:00:00.000Z",
      modifiedAt: "2023-01-01T00:00:00.000Z",
    };

    const config = mapper.dynamoEntityToAppConfig({
      entity,
    });

    expect(config).toBeInstanceOf(AppConfig);

    expect(config.getConfig()).toStrictEqual({
      segmentWriteKey: "encryptedKey",
    });
  });

  it("should map AppConfig to DynamoDB PutItemInput", () => {
    const mapper = new DynamoConfigMapper({
      encryptionKey,
      logger: createMockLogger(),
    });

    const config = new AppConfig({
      segmentWriteKey: "encryptedKey",
    });

    const entity = mapper.appConfigToDynamoPutEntity({
      config,
      saleorApiUrl: "saleorApiUrl",
      appId: "saleorAppId",
      configKey: "configKey",
    });

    expect(entity).toStrictEqual({
      PK: "saleorApiUrl#saleorAppId",
      SK: "APP_CONFIG#configKey",
      encryptedSegmentWriteKey: expect.any(String),
    });
  });
});
