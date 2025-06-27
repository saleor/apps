import { DynamodbVariantsStorageImpl } from "../dynamodb-variants-storage.impl";
import { variantUpdatedWebhookManifest } from "./webhook-manifest";

const repo = new DynamodbVariantsStorageImpl();

export const POST = variantUpdatedWebhookManifest.createHandler(async (req, ctx) => {
  const productVariantId = ctx.payload.productVariant?.id;

  if (!productVariantId) {
    return new Response("Variant ID not found", {
      status: 400,
    });
  }

  await repo.setDirtyVariant(productVariantId);

  /**
   *  1. Get product from subscription
   *  2. Save its id in dynamoDB and mark as dirty
   */

  return new Response("ok", {
    status: 200,
  });
});
