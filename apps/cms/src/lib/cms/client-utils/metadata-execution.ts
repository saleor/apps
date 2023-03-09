import { AuthData } from "@saleor/app-sdk/APL";
import { NextWebhookApiHandler } from "@saleor/app-sdk/handlers/next";
import {
  DeleteMetadataDocument,
  ProductVariantUpdatedWebhookPayloadFragment,
  UpdateMetadataDocument,
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
  productVariant: Exclude<
    ProductVariantUpdatedWebhookPayloadFragment["productVariant"],
    undefined | null
  >;
  cmsProviderInstanceIdsToCreate: Record<string, string>;
  cmsProviderInstanceIdsToDelete: Record<string, string>;
}) => {
  const { domain, token } = context.authData;
  const apiClient = createClient(`https://${domain}/graphql/`, async () => ({ token }));

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
