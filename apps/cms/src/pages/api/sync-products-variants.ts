import { createProtectedHandler, NextProtectedApiHandler } from "@saleor/app-sdk/handlers/next";
import { NextApiRequest, NextApiResponse } from "next";
import { WebhookProductVariantFragment } from "../../../generated/graphql";
import { saleorApp } from "../../../saleor-app";
import { executeCmsClientBatchOperation } from "../../lib/cms/client/clients-execution";
import { getProviderInstancesSettings } from "../../lib/cms/client/settings";
import { providersSchemaSet } from "../../lib/cms/config/providers";
import cmsProviders, { CMSProvider } from "../../lib/cms/providers";
import { logger as pinoLogger } from "../../lib/logger";
import { createClient } from "../../lib/graphql";
import { createSettingsManager } from "../../lib/metadata";

export interface SyncProductsVariantsApiPayload {
  channelSlug: string;
  providerInstanceId: string;
  productsVariants: WebhookProductVariantFragment[];
}

export interface SyncProductsVariantsApiResponse {
  success: boolean;
  data?: {
    createdCMSIds: string[];
    deletedCMSIds: string[];
  };
  error?: string;
}

const handler: NextProtectedApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<SyncProductsVariantsApiResponse>,
  context
) => {
  const { authData } = context;

  const logger = pinoLogger.child({
    endpoint: "sync-products-variants",
  });
  logger.debug("Called endpoint sync-products-variants");

  const client = createClient(authData.saleorApiUrl, async () => ({
    token: authData.token,
  }));

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
    });
  }

  // todo: add validation
  const { providerInstanceId, productsVariants } = req.body as SyncProductsVariantsApiPayload;

  const settingsManager = createSettingsManager(client);
  const providerInstancesSettingsParsed = await getProviderInstancesSettings(settingsManager);
  const providerInstanceSettings = providerInstancesSettingsParsed[providerInstanceId];

  const provider = cmsProviders[
    providerInstanceSettings.providerName as CMSProvider
  ] as (typeof cmsProviders)[keyof typeof cmsProviders];
  const validation =
    providersSchemaSet[providerInstanceSettings.providerName as CMSProvider].safeParse(
      providerInstanceSettings
    );

  logger.debug("The provider instance settings provider.");
  logger.debug({
    provider,
  });

  if (!validation.success) {
    // todo: use instead: throw new Error(validation.error.message);
    // continue with other provider instances
    logger.error("The provider instance settings validation failed.");
    logger.error({
      error: validation.error.message,
    });

    return res.status(400).json({
      success: false,
    });
  }

  const config = validation.data;

  logger.debug("The provider instance settings validated config.");
  logger.debug({
    config,
  });

  const syncResult = await executeCmsClientBatchOperation({
    cmsClient: {
      cmsProviderInstanceId: providerInstanceId,
      operationType: "createBatchProducts",
      operations: provider.create(config as any),
    },
    productsVariants,
  });

  return res.status(200).json({
    success: true,
    data: {
      createdCMSIds: syncResult?.createdCmsIds || [],
      deletedCMSIds: syncResult?.deletedCmsIds || [],
    },
    error: syncResult?.error,
  });
};

export default createProtectedHandler(handler, saleorApp.apl, ["MANAGE_APPS"]);
