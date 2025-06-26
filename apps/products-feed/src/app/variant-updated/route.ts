import { variantUpdatedWebhookManifest } from "./webhook-manifest";

export const POST = variantUpdatedWebhookManifest.createHandler((req, ctx) => {
  /**
   *  1. Get product from subscription
   *  2. Save its id in dynamoDB and mark as dirty
   */

  return new Response("ok", {
    status: 200,
  });
});
