import { dbVariantsStorage } from "../../modules/db-variants-storage/db-variants-storage.impl";
import { variantUpdatedWebhookManifest } from "./webhook-manifest";

export const POST = variantUpdatedWebhookManifest.createHandler(async (req, ctx) => {
  const productVariantId = ctx.payload.productVariant?.id;

  if (!productVariantId) {
    return new Response("Variant ID not found", {
      status: 400,
    });
  }

  await dbVariantsStorage.setDirtyVariant(ctx.authData, productVariantId);

  /**
   *  1. Get product from subscription
   *  2. Save its id in dynamoDB and mark as dirty
   */

  return new Response("ok", {
    status: 200,
  });
});
