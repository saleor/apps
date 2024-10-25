import { Client } from "urql";

import { GetSaleorInstanceDataDocument } from "../../generated/graphql";
import {
  doesErrorCodeExistsInErrors,
  WebhookMigrationAppPermissionDeniedError,
  WebhookMigrationNetworkError,
  WebhookMigrationUnknownError,
} from "../errors";
import { parseSchemaVersion } from "../parse-schema-version";

interface GetSaleorInstanceDetailsArgs {
  client: Client;
}

export type SaleorInstanceDetails = {
  version: number | null;
};

export const getSaleorInstanceDetails = async ({
  client,
}: GetSaleorInstanceDetailsArgs): Promise<SaleorInstanceDetails> => {
  const { data, error } = await client.query(GetSaleorInstanceDataDocument, {}).toPromise();

  if (doesErrorCodeExistsInErrors(error?.graphQLErrors, "PermissionDenied")) {
    throw new WebhookMigrationAppPermissionDeniedError(
      "App cannot be migrated because app token permission is no longer valid",
    );
  }

  if (error?.networkError) {
    throw new WebhookMigrationNetworkError("Network error while fetching shop details", {
      cause: error.networkError,
    });
  }

  const shop = data?.shop;

  if (!shop) {
    throw new WebhookMigrationUnknownError("Cannot fetch shop details", { cause: error });
  }

  return {
    version: parseSchemaVersion(shop.version),
  };
};
