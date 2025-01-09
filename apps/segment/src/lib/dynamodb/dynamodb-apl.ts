import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { APL, AplConfiguredResult, AplReadyResult, AuthData } from "@saleor/app-sdk/APL";

import { BaseError } from "@/errors";

import { SegmentConfigTable, SegmentConfigTableEntityFactory } from "./segment-config-table";
import { SegmentAPLRepository } from "./segment-repository";

export class DynamoDBApl implements APL {
  private segmentAplRepository: SegmentAPLRepository;
  private appManifestId: string;

  constructor({
    documentClient,
    tableName,
    appManifestId,
  }: {
    documentClient: DynamoDBDocumentClient;
    tableName: string;
    appManifestId: string;
  }) {
    const table = SegmentConfigTable.create({
      tableName,
      documentClient,
    });
    const segmentAPLEntity = SegmentConfigTableEntityFactory.createAPLEntity(table);

    this.segmentAplRepository = new SegmentAPLRepository({ segmentAPLEntity });
    this.appManifestId = appManifestId;
  }

  async get(saleorApiUrl: string): Promise<AuthData | undefined> {
    const possibleResult = await this.segmentAplRepository.getEntry({
      saleorApiUrl,
      appManifestId: this.appManifestId,
    });

    if (possibleResult.isErr()) {
      return undefined;
    }

    return {
      domain: possibleResult.value.domain,
      token: possibleResult.value.token,
      saleorApiUrl: possibleResult.value.saleorApiUrl,
      appId: possibleResult.value.appId,
      jwks: possibleResult.value.jwks,
    };
  }

  async set(authData: AuthData): Promise<void> {
    const possibleResult = await this.segmentAplRepository.setEntry({
      saleorApiUrl: authData.saleorApiUrl,
      authData,
      appManifestId: this.appManifestId,
    });

    if (possibleResult.isErr()) {
      throw new BaseError("Failed to set APL entry");
    }

    return undefined;
  }

  async delete(saleorApiUrl: string): Promise<void> {
    await this.segmentAplRepository.deleteEntry({
      saleorApiUrl,
      appManifestId: this.appManifestId,
    });
  }

  async getAll(): Promise<AuthData[]> {
    const entriesResult = await this.segmentAplRepository.getAllEntries({
      appManifestId: this.appManifestId,
    });

    if (entriesResult.isErr()) {
      return [];
    }

    return entriesResult.value.map((entry) => ({
      domain: entry.domain,
      token: entry.token,
      saleorApiUrl: entry.saleorApiUrl,
      appId: entry.appId,
      jwks: entry.jwks,
    }));
  }

  async isReady(): Promise<AplReadyResult> {
    const ready = this.envVariablesRequriedByDynamoDBExist();

    return ready
      ? {
          ready: true,
        }
      : {
          ready: false,
          error: new BaseError("Missing DyanmoDB env variables"),
        };
  }

  async isConfigured(): Promise<AplConfiguredResult> {
    const configured = this.envVariablesRequriedByDynamoDBExist();

    return configured
      ? {
          configured: true,
        }
      : {
          configured: false,
          error: new BaseError("Missing DyanmoDB env variables"),
        };
  }

  private envVariablesRequriedByDynamoDBExist() {
    const variables = [
      "DYNAMODB_CONFIG_TABLE_NAME",
      "AWS_REGION",
      /*
       * TODO: uncomment before release
       *   "AWS_ACCESS_KEY_ID",
       *   "AWS_SECRET_ACCESS_KEY",
       */
    ];

    // eslint-disable-next-line node/no-process-env
    return variables.every((variable) => !!process.env[variable]);
  }
}
