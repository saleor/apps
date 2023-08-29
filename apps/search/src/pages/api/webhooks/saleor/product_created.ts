import { NextWebhookApiHandler } from "@saleor/app-sdk/handlers/next";
import { ChannelsDocument, ProductCreated } from "../../../../../generated/graphql";
import { AlgoliaSearchProvider } from "../../../../lib/algolia/algoliaSearchProvider";
import { getAlgoliaConfiguration } from "../../../../lib/algolia/getAlgoliaConfiguration";
import { WebhookActivityTogglerService } from "../../../../domain/WebhookActivityToggler.service";
import { createLogger } from "../../../../lib/logger";
import { createGraphQLClient } from "@saleor/apps-shared";
import { webhookProductCreated } from "../../../../webhooks/definitions/product-created";

export const config = {
  api: {
    bodyParser: false,
  },
};

const logger = createLogger({
  service: "webhookProductCreatedWebhookHandler",
});

export const handler: NextWebhookApiHandler<ProductCreated> = async (req, res, context) => {
  const { event, authData } = context;

  logger.debug(
    `New event ${event} (${context.payload?.__typename}) from the ${authData.domain} domain has been received!`,
  );

  const { product } = context.payload;

  if (!product) {
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
    await searchProvider.createProduct(product);
  } catch (e) {
    logger.info(e, "Algolia createProduct failed. Webhooks will be disabled");

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

export default webhookProductCreated.createHandler(handler);
