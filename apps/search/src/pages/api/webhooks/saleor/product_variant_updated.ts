import { NextWebhookApiHandler } from "@saleor/app-sdk/handlers/next";
import { createGraphQLClient } from "@saleor/apps-shared";
import { ChannelsDocument, ProductVariantUpdated } from "../../../../../generated/graphql";
import { WebhookActivityTogglerService } from "../../../../domain/WebhookActivityToggler.service";
import { AlgoliaSearchProvider } from "../../../../lib/algolia/algoliaSearchProvider";
import { getAlgoliaConfiguration } from "../../../../lib/algolia/getAlgoliaConfiguration";
import { createLogger } from "../../../../lib/logger";
import { webhookProductVariantUpdated } from "../../../../webhooks/definitions/product-variant-updated";

export const config = {
  api: {
    bodyParser: false,
  },
};

const logger = createLogger({
  service: "webhookProductVariantUpdatedWebhookHandler",
});

export const handler: NextWebhookApiHandler<ProductVariantUpdated> = async (req, res, context) => {
  const { event, authData } = context;

  logger.debug(
    `New event ${event} (${context.payload?.__typename}) from the ${authData.domain} domain has been received!`,
  );

  const { productVariant } = context.payload;

  if (!productVariant) {
    logger.error("Webhook did not received expected product data in the payload.");
    return res.status(200).end();
  }

  const { settings, errors } = await getAlgoliaConfiguration({ authData });
  const client = createGraphQLClient({
    saleorApiUrl: authData.saleorApiUrl,
    token: authData.token,
  });
  const { data: channelsData } = await client.query(ChannelsDocument, {}).toPromise();
  const channels = channelsData?.channels || [];

  if (errors?.length || !settings) {
    logger.warn("Aborting due to lack of settings");
    logger.debug(errors);

    return res.status(400).json({
      message: errors[0].message,
    });
  }

  const searchProvider = new AlgoliaSearchProvider({
    appId: settings.appId,
    apiKey: settings.secretKey,
    indexNamePrefix: settings.indexNamePrefix,
    channels,
  });

  try {
    logger.debug("Updating variant");
    await searchProvider.updateProductVariant(productVariant);
  } catch (e) {
    logger.info(e, "Algolia updateProductVariant failed. Webhooks will be disabled");

    const webhooksToggler = new WebhookActivityTogglerService(
      authData.appId,
      createGraphQLClient({ saleorApiUrl: authData.saleorApiUrl, token: authData.token }),
    );

    logger.trace("Will disable webhooks");

    await webhooksToggler.disableOwnWebhooks(context.payload.recipient?.webhooks?.map((w) => w.id));

    logger.trace("Webhooks disabling operation finished");

    return res.status(500).send("Operation failed, webhooks are disabled");
  }

  res.status(200).end();
  return;
};

export default webhookProductVariantUpdated.createHandler(handler);
