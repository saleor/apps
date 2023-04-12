import { NextWebhookApiHandler } from "@saleor/app-sdk/handlers/next";
import { Client } from "urql";
import {
  DeleteMetadataDocument,
  UpdateMetadataDocument,
  WebhookProductVariantFragment,
} from "../../../../generated/graphql";
import { createClient } from "../../graphql";
import { createCmsKeyForSaleorItem } from "./metadata";

type WebhookContext = Parameters<NextWebhookApiHandler>["2"];

export type MetadataRecord = Record<string, string>;

const executeMetadataUpdateMutation = async ({
  apiClient,
  itemId,
  cmsProviderInstanceIdsToCreate = {},
  cmsProviderInstanceIdsToDelete = {},
}: {
  apiClient: Client;
  itemId: string;
  cmsProviderInstanceIdsToCreate?: Record<string, string>;
  cmsProviderInstanceIdsToDelete?: Record<string, string>;
}) => {
  if (Object.keys(cmsProviderInstanceIdsToCreate).length) {
    await apiClient
      .mutation(UpdateMetadataDocument, {
        id: itemId,
        input: Object.entries(cmsProviderInstanceIdsToCreate).map(
          ([cmsProviderInstanceId, cmsProductVariantId]) => ({
            key: createCmsKeyForSaleorItem(cmsProviderInstanceId),
            value: cmsProductVariantId,
          })
        ),
      })
      .toPromise();
  }
  if (Object.keys(cmsProviderInstanceIdsToDelete).length) {
    await apiClient
      .mutation(DeleteMetadataDocument, {
        id: itemId,
        keys: Object.entries(cmsProviderInstanceIdsToDelete).map(([cmsProviderInstanceId]) =>
          createCmsKeyForSaleorItem(cmsProviderInstanceId)
        ),
      })
      .toPromise();
  }
};

export const updateMetadata = async ({
  context,
  productVariant,
  cmsProviderInstanceIdsToCreate,
  cmsProviderInstanceIdsToDelete,
}: {
  context: WebhookContext;
  productVariant: WebhookProductVariantFragment;
  cmsProviderInstanceIdsToCreate: Record<string, string>;
  cmsProviderInstanceIdsToDelete: Record<string, string>;
}) => {
  const { token, saleorApiUrl } = context.authData;
  const apiClient = createClient(saleorApiUrl, async () => ({ token }));

  await executeMetadataUpdateMutation({
    apiClient,
    itemId: productVariant.id,
    cmsProviderInstanceIdsToCreate,
    cmsProviderInstanceIdsToDelete,
  });
};

type ItemMetadataRecord = {
  id: string;
  cmsProviderInstanceIds: MetadataRecord;
};

export const batchUpdateMetadata = async ({
  context,
  variantCMSProviderInstanceIdsToCreate,
  variantCMSProviderInstanceIdsToDelete,
}: {
  context: Pick<WebhookContext, "authData">;
  variantCMSProviderInstanceIdsToCreate: ItemMetadataRecord[];
  variantCMSProviderInstanceIdsToDelete: ItemMetadataRecord[];
}) => {
  const { token, saleorApiUrl } = context.authData;
  const apiClient = createClient(saleorApiUrl, async () => ({ token }));

  const variantCMSProviderInstanceIdsToCreateMap = variantCMSProviderInstanceIdsToCreate.reduce(
    (acc, { id, cmsProviderInstanceIds }) => ({
      ...acc,
      [id]: {
        ...(acc[id] || {}),
        ...cmsProviderInstanceIds,
      },
    }),
    {} as Record<string, MetadataRecord>
  );
  const variantCMSProviderInstanceIdsToDeleteMap = variantCMSProviderInstanceIdsToDelete.reduce(
    (acc, { id, cmsProviderInstanceIds }) => ({
      ...acc,
      [id]: {
        ...(acc[id] || {}),
        ...cmsProviderInstanceIds,
      },
    }),
    {} as Record<string, MetadataRecord>
  );

  const mutationsToExecute = [
    Object.entries(variantCMSProviderInstanceIdsToCreateMap).map(
      ([itemId, cmsProviderInstanceIdsToCreate]) =>
        executeMetadataUpdateMutation({
          apiClient,
          itemId,
          cmsProviderInstanceIdsToCreate,
        })
    ),
    Object.entries(variantCMSProviderInstanceIdsToDeleteMap).map(
      ([itemId, cmsProviderInstanceIdsToDelete]) =>
        executeMetadataUpdateMutation({
          apiClient,
          itemId,
          cmsProviderInstanceIdsToDelete,
        })
    ),
  ];

  await Promise.all(mutationsToExecute);
};
