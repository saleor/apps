import { createProtectedHandler, NextProtectedApiHandler } from "@saleor/app-sdk/handlers/next";
import { NextApiRequest, NextApiResponse } from "next";
import { WebhookProductVariantFragment } from "../../../generated/graphql";
import { saleorApp } from "../../../saleor-app";
import { executeCmsClientBatchOperation } from "../../lib/cms/client/clients-execution";
import { getChannelsSettings, getProviderInstancesSettings } from "../../lib/cms/client/settings";
import { providersSchemaSet } from "../../lib/cms/config/providers";
import { cmsProviders, CMSProvider } from "../../lib/cms/providers";
import { logger as pinoLogger } from "../../lib/logger";
import { createClient } from "../../lib/graphql";
import { createSettingsManager } from "../../lib/metadata";
import { batchUpdateMetadata, MetadataRecord } from "../../lib/cms/client/metadata-execution";
import { CmsBatchOperations } from "../../lib/cms/types";

export interface SyncProductsVariantsApiPayload {
  channelSlug: string;
  providerInstanceId: string;
  productsVariants: WebhookProductVariantFragment[];
  operation: "ADD" | "DELETE";
}

export interface SyncProductsVariantsApiResponse {
  success: boolean;
  data?: {
    createdCMSIds: MetadataRecord[];
    deletedCMSIds: MetadataRecord[];
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

  // todo: change to zod validation
  const { providerInstanceId, productsVariants, operation } =
    req.body as SyncProductsVariantsApiPayload;

  if (!providerInstanceId) {
    return res.status(400).json({
      success: false,
      error: "The provider instance id is missing.",
    });
  }

  if (!productsVariants || productsVariants?.length === 0) {
    return res.status(400).json({
      success: false,
      error: "The products variants are missing.",
    });
  }

  if (!operation || (operation !== "ADD" && operation !== "DELETE")) {
    return res.status(400).json({
      success: false,
      error: "The operation is missing or invalid. Allowed operations: ADD, DELETE.",
    });
  }
  const operationType: keyof CmsBatchOperations =
    operation === "ADD" ? "createBatchProducts" : "deleteBatchProducts";

  const settingsManager = createSettingsManager(client);
  const [providerInstancesSettingsParsed, channelsSettingsParsed] = await Promise.all([
    getProviderInstancesSettings(settingsManager),
    getChannelsSettings(settingsManager),
  ]);
  const providerInstanceSettings = providerInstancesSettingsParsed[providerInstanceId];

  const provider = cmsProviders[
    providerInstanceSettings.providerName as CMSProvider
  ] as (typeof cmsProviders)[keyof typeof cmsProviders];
  const validation =
    providersSchemaSet[providerInstanceSettings.providerName as CMSProvider].safeParse(
      providerInstanceSettings
    );

  logger.debug({ provider }, "The provider instance settings provider.");

  if (!validation.success) {
    // todo: use instead: throw new Error(validation.error.message);
    // continue with other provider instances
    logger.error(
      { error: validation.error.message },
      "The provider instance settings validation failed."
    );

    return res.status(400).json({
      success: false,
    });
  }

  const config = validation.data;

  logger.debug({ config }, "The provider instance settings validated config.");

  const enabledChannelsForSelectedProviderInstance = Object.entries(channelsSettingsParsed).reduce(
    (enabledChannels, [channelSlug, channelSettingsParsed]) => {
      if (channelSettingsParsed.enabledProviderInstances.includes(providerInstanceId)) {
        return [...enabledChannels, channelSlug];
      }
      return enabledChannels;
    },
    [] as string[]
  );

  // todo: make it later a method of kinda ChannelsSettingsRepository instantiated only once
  const verifyIfProductVariantIsAvailableInOtherChannelEnabledForSelectedProviderInstance = (
    productVariant: WebhookProductVariantFragment
  ) => {
    const variantAvailableChannels = productVariant.channelListings?.map((cl) => cl.channel.slug);
    const isAvailable = variantAvailableChannels?.some((channel) =>
      enabledChannelsForSelectedProviderInstance.includes(channel)
    );
    return !!isAvailable;
  };

  const syncResult = await executeCmsClientBatchOperation({
    cmsClient: {
      cmsProviderInstanceId: providerInstanceId,
      operationType,
      operations: provider.create(config as any),
    },
    productsVariants,
    verifyIfProductVariantIsAvailableInOtherChannelEnabledForSelectedProviderInstance,
  });

  await batchUpdateMetadata({
    context,
    variantCMSProviderInstanceIdsToCreate:
      syncResult?.createdCmsIds?.map((cmsId) => ({
        id: cmsId.saleorId,
        cmsProviderInstanceIds: { [providerInstanceId]: cmsId.id },
      })) || [],
    variantCMSProviderInstanceIdsToDelete:
      syncResult?.deletedCmsIds?.map((cmsId) => ({
        id: cmsId.saleorId,
        cmsProviderInstanceIds: { [providerInstanceId]: cmsId.id },
      })) || [],
  });

  if (syncResult?.error) {
    logger.error({ error: syncResult.error }, "The sync result error.");
    return res.status(500).json({
      success: false,
      data: {
        createdCMSIds: syncResult?.createdCmsIds || [],
        deletedCMSIds: syncResult?.deletedCmsIds || [],
      },
      error: syncResult?.error,
    });
  }

  logger.debug("The sync result success.");
  return res.status(200).json({
    success: true,
    data: {
      createdCMSIds: syncResult?.createdCmsIds || [],
      deletedCMSIds: syncResult?.deletedCmsIds || [],
    },
  });
};

export default createProtectedHandler(handler, saleorApp.apl, ["MANAGE_APPS"]);
