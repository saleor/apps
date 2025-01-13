import { APL, AplConfiguredResult, AplReadyResult, AuthData } from "@saleor/app-sdk/APL";

import { BaseError } from "@/errors";
import { SegmentAPLRepository } from "@/modules/db/segment-apl-repository";
import { SegmentAPLEntityType } from "@/modules/db/segment-main-table";

export class DynamoAPL implements APL {
  private segmentAPLRepository: SegmentAPLRepository;

  static SetAuthDataError = BaseError.subclass("SetAuthDataError");
  static DeleteAuthDataError = BaseError.subclass("DeleteAuthDataError");
  static MissingEnvVariablesError = BaseError.subclass("MissingEnvVariablesError");

  constructor({ segmentAPLEntity }: { segmentAPLEntity: SegmentAPLEntityType }) {
    this.segmentAPLRepository = new SegmentAPLRepository({ segmentAPLEntity });
  }

  async get(saleorApiUrl: string): Promise<AuthData | undefined> {
    const getEntryResult = await this.segmentAPLRepository.getEntry({
      saleorApiUrl,
    });

    if (getEntryResult.isErr()) {
      // TODO: should we throw here?
      return undefined;
    }

    return getEntryResult.value;
  }

  async set(authData: AuthData): Promise<void> {
    const setEntryResult = await this.segmentAPLRepository.setEntry({
      authData,
    });

    if (setEntryResult.isErr()) {
      throw new DynamoAPL.SetAuthDataError("Failed to set APL entry", {
        cause: setEntryResult.error,
      });
    }

    return undefined;
  }

  async delete(saleorApiUrl: string): Promise<void> {
    const deleteEntryResult = await this.segmentAPLRepository.deleteEntry({
      saleorApiUrl,
    });

    if (deleteEntryResult.isErr()) {
      throw new DynamoAPL.DeleteAuthDataError("Failed to delete APL entry", {
        cause: deleteEntryResult.error,
      });
    }

    return undefined;
  }

  async getAll(): Promise<AuthData[]> {
    const getAllEntriesResult = await this.segmentAPLRepository.getAllEntries();

    if (getAllEntriesResult.isErr()) {
      // TODO: should we throw here?
      return [];
    }

    return getAllEntriesResult.value;
  }

  async isReady(): Promise<AplReadyResult> {
    const ready = this.envVariablesRequriedByDynamoDBExist();

    return ready
      ? {
          ready: true,
        }
      : {
          ready: false,
          error: new DynamoAPL.MissingEnvVariablesError("Missing DynamoDB env variables"),
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
          error: new DynamoAPL.MissingEnvVariablesError("Missing DynamoDB env variables"),
        };
  }

  private envVariablesRequriedByDynamoDBExist() {
    const variables = [
      "DYNAMODB_MAIN_TABLE_NAME",
      "AWS_REGION",
      "AWS_ACCESS_KEY_ID",
      "AWS_SECRET_ACCESS_KEY",
    ];

    // eslint-disable-next-line node/no-process-env
    return variables.every((variable) => !!process.env[variable]);
  }
}
