import { DeleteItemCommand, Entity, GetItemCommand, Parser, PutItemCommand, string } from "dynamodb-toolbox";
import { item } from "dynamodb-toolbox/schema/item";
import { err, ok, Result } from "neverthrow";

import { createLogger } from "@/lib/logger";
import { DynamoMainTable,dynamoMainTable } from "@/modules/dynamodb/dynamo-main-table";

import { ShopifyConnectionConfig } from "../domain/shopify-connection-config";
import {
  ConnectionConfigRepo,
  ConnectionConfigRepoError,
  ConnectionConfigRepoErrorType,
} from "./connection-config-repo";

const logger = createLogger("ConnectionConfigRepoImpl");

const CONNECTION_CONFIG_SK = "CONNECTION_CONFIG";

const ConnectionConfigSchema = item({
  PK: string().key(),
  SK: string().key(),
  shopDomain: string(),
  accessToken: string(),
  apiVersion: string(),
});

const ConnectionConfigEntity = new Entity({
  table: dynamoMainTable,
  name: "ConnectionConfig",
  schema: ConnectionConfigSchema,
});

class ConnectionConfigRepoImpl implements ConnectionConfigRepo {
  async get(args: {
    saleorApiUrl: string;
    appId: string;
  }): Promise<Result<ShopifyConnectionConfig | null, ConnectionConfigRepoErrorType>> {
    const pk = DynamoMainTable.getPrimaryKeyScopedToInstallation({
      saleorApiUrl: args.saleorApiUrl,
      appId: args.appId,
    });

    logger.debug("Fetching connection config", { pk });

    try {
      const command = ConnectionConfigEntity.build(GetItemCommand).key({
        PK: pk,
        SK: CONNECTION_CONFIG_SK,
      });

      const result = await command.send();

      if (!result.Item) {
        logger.debug("Connection config not found", { pk });

        return ok(null);
      }

      const parsed = ConnectionConfigSchema.build(Parser).parse(result.Item);

      const config = ShopifyConnectionConfig.create({
        shopDomain: parsed.shopDomain,
        accessToken: parsed.accessToken,
        apiVersion: parsed.apiVersion,
      });

      if (config.isErr()) {
        logger.error("Failed to parse connection config from DynamoDB", {
          error: config.error,
        });

        return err(
          new ConnectionConfigRepoError("Failed to parse connection config", {
            cause: config.error,
          })
        );
      }

      return ok(config.value);
    } catch (error) {
      logger.error("Failed to fetch connection config", {
        errorMessage: error instanceof Error ? error.message : String(error),
      });

      return err(
        new ConnectionConfigRepoError("Failed to fetch connection config", {
          cause: error,
        })
      );
    }
  }

  async save(args: {
    saleorApiUrl: string;
    appId: string;
    config: ShopifyConnectionConfig;
  }): Promise<Result<void, ConnectionConfigRepoErrorType>> {
    const pk = DynamoMainTable.getPrimaryKeyScopedToInstallation({
      saleorApiUrl: args.saleorApiUrl,
      appId: args.appId,
    });

    logger.debug("Saving connection config", { pk, shopDomain: args.config.shopDomain });

    try {
      const command = ConnectionConfigEntity.build(PutItemCommand).item({
        PK: pk,
        SK: CONNECTION_CONFIG_SK,
        shopDomain: args.config.shopDomain,
        accessToken: args.config.accessToken,
        apiVersion: args.config.apiVersion,
      });

      await command.send();

      return ok(undefined);
    } catch (error) {
      logger.error("Failed to save connection config", {
        errorMessage: error instanceof Error ? error.message : String(error),
      });

      return err(
        new ConnectionConfigRepoError("Failed to save connection config", {
          cause: error,
        })
      );
    }
  }

  async delete(args: {
    saleorApiUrl: string;
    appId: string;
  }): Promise<Result<void, ConnectionConfigRepoErrorType>> {
    const pk = DynamoMainTable.getPrimaryKeyScopedToInstallation({
      saleorApiUrl: args.saleorApiUrl,
      appId: args.appId,
    });

    logger.debug("Deleting connection config", { pk });

    try {
      const command = ConnectionConfigEntity.build(DeleteItemCommand).key({
        PK: pk,
        SK: CONNECTION_CONFIG_SK,
      });

      await command.send();

      return ok(undefined);
    } catch (error) {
      logger.error("Failed to delete connection config", {
        errorMessage: error instanceof Error ? error.message : String(error),
      });

      return err(
        new ConnectionConfigRepoError("Failed to delete connection config", {
          cause: error,
        })
      );
    }
  }
}

export const connectionConfigRepoImpl = new ConnectionConfigRepoImpl();
