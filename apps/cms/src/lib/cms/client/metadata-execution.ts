import { NextWebhookApiHandler } from "@saleor/app-sdk/handlers/next";
import {
  DeleteMetadataDocument,
  UpdateMetadataDocument,
  WebhookProductVariantFragment,
} from "../../../../generated/graphql";
import { createClient } from "../../graphql";
import { createCmsKeyForSaleorItem } from "./metadata";

type WebhookContext = Parameters<NextWebhookApiHandler>["2"];

export const executeMetadataUpdate = async ({
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

  if (Object.keys(cmsProviderInstanceIdsToCreate).length) {
    await apiClient
      .mutation(UpdateMetadataDocument, {
        id: productVariant.id,
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
        id: productVariant.id,
        keys: Object.entries(cmsProviderInstanceIdsToDelete).map(([cmsProviderInstanceId]) =>
          createCmsKeyForSaleorItem(cmsProviderInstanceId)
        ),
      })
      .toPromise();
  }
};
