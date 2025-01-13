import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import {
  decrypt,
  DeleteSettingsValue,
  encrypt,
  SettingsManager,
  SettingsValue,
} from "@saleor/app-sdk/settings-manager";

import { BaseError } from "@/errors";
import { SegmentConfigRepository } from "@/lib/dynamodb/segment-config-repository";
import {
  SegmentConfigTable,
  SegmentConfigTableEntityFactory,
} from "@/lib/dynamodb/segment-config-table";

export class DynamoDBEncryptedSettingsManager implements SettingsManager {
  private segmentConfigRepository: SegmentConfigRepository;
  private saleorApiUrl: string;
  private appId: string;
  private encryptionKey: string;

  constructor({
    documentClient,
    tableName,
    saleorApiUrl,
    appId,
    encryptionKey,
  }: {
    documentClient: DynamoDBDocumentClient;
    tableName: string;
    saleorApiUrl: string;
    appId: string;
    encryptionKey: string;
  }) {
    const table = SegmentConfigTable.create({
      tableName,
      documentClient,
    });

    const segmentConfigEntity = SegmentConfigTableEntityFactory.createConfigEntity(table);

    this.segmentConfigRepository = new SegmentConfigRepository({ segmentConfigEntity });
    this.saleorApiUrl = saleorApiUrl;
    this.appId = appId;
    this.encryptionKey = encryptionKey;
  }

  async get(key: string, _domain?: string): Promise<string | undefined> {
    const possibleResult = await this.segmentConfigRepository.getConfig({
      saleorApiUrl: this.saleorApiUrl,
      appId: this.appId,
      configKey: key,
    });

    if (possibleResult.isErr()) {
      // TODO: what do there?
      return undefined;
    }

    return decrypt(possibleResult.value.value, this.encryptionKey);
  }

  async set(settings: SettingsValue[] | SettingsValue): Promise<void> {
    if (Array.isArray(settings)) {
      settings.forEach(async (setting) => {
        // TODO: consider batching
        const possibleResult = await this.segmentConfigRepository.setConfig({
          appId: this.appId,
          saleorApiUrl: this.saleorApiUrl,
          configKey: setting.key,
          configValue: encrypt(setting.value, this.encryptionKey),
        });

        if (possibleResult.isErr()) {
          throw new BaseError("Failed to set config entries");
        }
      });

      return undefined;
    }

    const possibleResult = await this.segmentConfigRepository.setConfig({
      appId: this.appId,
      saleorApiUrl: this.saleorApiUrl,
      configKey: settings.key,
      configValue: encrypt(settings.value, this.encryptionKey),
    });

    if (possibleResult.isErr()) {
      throw new BaseError("Failed to set config entry");
    }

    return undefined;
  }

  async delete(
    args: DeleteSettingsValue | DeleteSettingsValue[] | string | string[],
  ): Promise<void> {
    /*
     * TODO: implement delete
     */
    throw new BaseError("Not implemented");
  }
}
