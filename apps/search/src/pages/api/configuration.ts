import type { NextApiRequest, NextApiResponse } from "next";

import { createClient } from "../../lib/graphql";
import { saleorApp } from "../../../saleor-app";

import { createProtectedHandler, ProtectedHandlerContext } from "@saleor/app-sdk/handlers/next";
import { createLogger } from "../../lib/logger";
import { AppConfigurationFields, AppConfigurationSchema } from "../../domain/configuration";
import { AlgoliaSearchProvider } from "../../lib/algolia/algoliaSearchProvider";
import { WebhookActivityTogglerService } from "../../domain/WebhookActivityToggler.service";
import { algoliaConfigurationRepository } from "../../domain/algolia-configuration/AlgoliaConfigurationRepository";

const logger = createLogger({
  handler: "api/configuration",
});

export const handler = async (
  req: NextApiRequest,
  res: NextApiResponse,
  ctx: ProtectedHandlerContext
) => {
  const {
    authData: { token, saleorApiUrl },
  } = ctx;

  logger.debug({ saleorApiUrl }, "handler called");

  const client = createClient(saleorApiUrl, async () => Promise.resolve({ token: token }));

  // todo extract endpoints, add trpc
  if (req.method === "GET") {
    logger.debug("Returning configuration");

    const configuration = await algoliaConfigurationRepository.getConfiguration(saleorApiUrl);

    return configuration
      ? res.status(200).send({
          success: true,
          data: AppConfigurationSchema.parse(configuration), // todo probably remove Zod at this point
        })
      : res.status(404).send({
          success: false,
        });
  } else if (req.method === "POST") {
    logger.debug("Updating the configuration");

    const { appId, secretKey, indexNamePrefix } = JSON.parse(req.body) as AppConfigurationFields;

    const algoliaClient = new AlgoliaSearchProvider({
      appId,
      apiKey: secretKey,
      indexNamePrefix: indexNamePrefix,
    });

    try {
      logger.debug("Will ping Algolia");
      await algoliaClient.ping();

      logger.debug("Algolia connection is ok. Will save settings");

      const configuration = await algoliaConfigurationRepository.setConfiguration(saleorApiUrl, {
        appId,
        secretKey,
        indexNamePrefix,
      });

      logger.debug("Settings set");

      const webhooksToggler = new WebhookActivityTogglerService(ctx.authData.appId, client);

      await webhooksToggler.enableOwnWebhooks();

      logger.debug("Webhooks enabled");

      return res.status(200).send({
        success: true,
        data: AppConfigurationSchema.parse(configuration), // todo probably remove Zod at this point
      });
    } catch (e) {
      return res.status(400).end();
    }
  }
  logger.error("Method not supported");

  res.status(405).end();
};

export default createProtectedHandler(handler, saleorApp.apl, ["MANAGE_APPS", "MANAGE_PRODUCTS"]);
