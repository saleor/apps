import { variantUpdatedWebhookManifest } from "./webhook-manifest";

interface IDynamoDbRepo {
  setDirtyVariant(variantId: string): Promise<void>;
  getDirtyVariants(
    access: { saleorApiUrl: string; appId: string },
    limit: number,
  ): Promise<string[]>;
}

//todo move somewhere
export class DynamoDbRepo implements IDynamoDbRepo {
  setDirtyVariant(variantId: string): Promise<void> {
    // todo implement
    throw new Error("Method not implemented.");
  }
  getDirtyVariants(
    access: { saleorApiUrl: string; appId: string },
    limit = 100,
  ): Promise<string[]> {
    throw new Error("Method not implemented.");
  }
}

const repo = new DynamoDbRepo();

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
