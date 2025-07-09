import { AuthData } from "@saleor/app-sdk/APL";
import { Logger } from "@saleor/apps-logger";
import { DeleteItemCommand, GetItemCommand, PutItemCommand, ScanCommand } from "dynamodb-toolbox";
import { Parser } from "dynamodb-toolbox/schema/actions/parse";

import { AplAccessPattern, AplEntrySchema, DynamoDbAplEntity } from "./apl-db-model";
import { APLRepository } from "./apl-repository";

export class DynamoAPLRepository implements APLRepository {
  private aplEntity: DynamoDbAplEntity;
  private access = new AplAccessPattern();
  private logger: Logger;

  constructor(deps: { entity: DynamoDbAplEntity; logger: Logger }) {
    this.aplEntity = deps.entity;
    this.logger = deps.logger;
  }

  async getEntry(args: { saleorApiUrl: string }): Promise<AuthData | null> {
    const result = await this.aplEntity
      .build(GetItemCommand)
      .key({
        PK: this.access.getPK({
          saleorApiUrl: args.saleorApiUrl,
        }),
        SK: this.access.getSK(),
      })
      .send();

    if (!result.Item) {
      this.logger.warn("APL entry not found", { args });

      return null;
    }
    const { saleorApiUrl, jwks, token, appId } = AplEntrySchema.build(Parser).parse(result.Item);

    return {
      saleorApiUrl,
      appId,
      jwks,
      token,
    };
  }

  async setEntry({ authData }: { authData: AuthData }) {
    await this.aplEntity
      .build(PutItemCommand)
      .item({
        PK: this.access.getPK({ saleorApiUrl: authData.saleorApiUrl }),
        SK: this.access.getSK(),
        token: authData.token,
        saleorApiUrl: authData.saleorApiUrl,
        appId: authData.appId,
        jwks: authData.jwks,
      })
      .send();

    return undefined;
  }

  async deleteEntry(args: { saleorApiUrl: string }) {
    await this.aplEntity
      .build(DeleteItemCommand)
      .key({
        PK: this.access.getPK({
          saleorApiUrl: args.saleorApiUrl,
        }),
        SK: this.access.getSK(),
      })
      .send();

    return undefined;
  }

  async getAllEntries() {
    const scanEntriesResult = await this.aplEntity.table
      .build(ScanCommand)
      .entities(this.aplEntity)
      .options({
        // keep all the entries in memory - we should introduce pagination in the future
        maxPages: Infinity,
      })
      .send();

    const possibleItems = scanEntriesResult.Items ?? [];

    if (possibleItems.length > 0) {
      return possibleItems.map((item) => {
        const { appId, jwks, token, saleorApiUrl } = item;

        return {
          saleorApiUrl,
          appId,
          jwks,
          token,
        };
      });
    }

    return null;
  }
}
