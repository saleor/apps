import { createProtectedHandler } from "@saleor/app-sdk/handlers/next";
import { saleorApp } from "../../../saleor-app";
import { createClient } from "../../lib/graphql";
import { FetchOwnWebhooksDocument } from "../../../generated/graphql";
import { AlgoliaSearchProvider } from "../../lib/algolia/algoliaSearchProvider";

export default createProtectedHandler(
  async (req, res, ctx) => {
    const { authData } = ctx;
    const client = createClient(authData.saleorApiUrl, async () => ({
      token: authData.token,
    }));

    // todo fetch settings, call algolia, disable webhooks if needed

    try {
      const webhooks = await client
        .query(FetchOwnWebhooksDocument, { id: authData.appId })
        .toPromise()
        .then((r) => r.data?.app?.webhooks);

      if (!webhooks) {
        return res.status(500).end();
      }

      return res.status(200).json(webhooks);
    } catch (e) {
      return res.status(500).end();
    }
  },
  saleorApp.apl,
  []
);
