import { verifyJWT } from "@saleor/app-sdk/auth";
import { SALEOR_API_URL_HEADER, SALEOR_AUTHORIZATION_BEARER_HEADER } from "@saleor/app-sdk/headers";
import { createGraphQLClient } from "@saleor/apps-shared/create-graphql-client";
import { type TransactionModel } from "avatax/lib/models/TransactionModel";
import { type NextRequest } from "next/server";

import { metadataCache } from "@/lib/app-metadata-cache";
import { createLogger } from "@/logger";
import { createSettingsManager } from "@/modules/app/metadata-manager";
import { type AvataxConfig } from "@/modules/avatax/avatax-connection-schema";
import { AvataxSdkClientFactory } from "@/modules/avatax/avatax-sdk-client-factory";
import { AvataxTransactionDetailsFetcher } from "@/modules/avatax/avatax-transaction-details-fetcher";
import { CrudSettingsManager } from "@/modules/crud-settings/crud-settings.service";
import { type OrderDetailsResponse } from "@/modules/order-details/order-details.types";
import { TAX_PROVIDER_KEY } from "@/modules/provider-connections/public-provider-connections.service";

import { OrderAvataxIdDocument } from "../../../../generated/graphql";
import { apl } from "../../../../saleor-app";

type CacheValue = {
  avataxTransaction: TransactionModel;
};

type CacheKeySet = {
  orderId: string;
  saleorApiUrl: string;
  appId: string;
  avataxId: string;
};

// In memory cache that sometimes will speed up lambda
const cache = new Map<string, CacheValue>();

const generateCacheKey = ({ saleorApiUrl, appId, orderId, avataxId }: CacheKeySet) =>
  [saleorApiUrl, appId, orderId, avataxId].join("-");

const addToCache = (keySet: CacheKeySet, value: CacheValue) => {
  cache.set(generateCacheKey(keySet), value);
};

const getFromCache = (keySet: CacheKeySet): CacheValue | undefined => {
  return cache.get(generateCacheKey(keySet));
};

const logger = createLogger("orderDetailsHandler");

const orderDetailsHandler = async (req: NextRequest) => {
  const orderId = req.nextUrl.searchParams.get("orderId") ?? undefined;
  const saleorApiUrl = req.headers.get(SALEOR_API_URL_HEADER) ?? undefined;
  const accessToken = req.headers.get(SALEOR_AUTHORIZATION_BEARER_HEADER) ?? undefined;

  if (!saleorApiUrl || !accessToken) {
    return new Response("Missing auth headers", { status: 401 });
  }

  const authData = await apl.get(saleorApiUrl);

  if (!authData) {
    return new Response("Not authorized", { status: 401 });
  }

  try {
    await verifyJWT({
      token: accessToken,
      appId: authData.appId,
      saleorApiUrl,
    });
  } catch (e) {
    logger.warn("Failed to verify JWT", { error: e });

    return new Response("Failed to verify JWT", { status: 401 });
  }

  if (!orderId) {
    return new Response("Order ID is missing", { status: 400 });
  }

  const client = createGraphQLClient({ token: authData.token, saleorApiUrl });

  const orderMetadata = await client.query(OrderAvataxIdDocument, {
    id: orderId,
  });

  if (orderMetadata.error) {
    return new Response("Failed to fetch order", { status: 500 });
  }

  const avataxId = orderMetadata.data?.order?.avataxId;

  if (!avataxId || !orderMetadata.data?.order) {
    return Response.json({ applicable: false } satisfies OrderDetailsResponse, { status: 202 });
  }

  const cacheKeySet = {
    saleorApiUrl,
    appId: authData.appId,
    orderId,
    avataxId,
  };

  const cachedValue = getFromCache(cacheKeySet);

  const channelSlug = orderMetadata.data.order.channel.slug;

  const settingsManager = createSettingsManager(client, authData.appId, metadataCache);

  const connectionsManager = new CrudSettingsManager({
    saleorApiUrl,
    metadataKey: "channel-configuration",
    metadataManager: settingsManager,
  });

  const configManager = new CrudSettingsManager({
    saleorApiUrl,
    metadataKey: TAX_PROVIDER_KEY,
    metadataManager: settingsManager,
  });

  const allConfigs = await connectionsManager.readAll();
  const relatedConfigId = allConfigs.data.find((d) => d.config.slug === channelSlug)?.config
    .providerConnectionId;

  if (!relatedConfigId) {
    return new Response("App is not configured", { status: 400 });
  }

  const thisConfig = (await configManager.readById(relatedConfigId)).data
    .config as unknown as AvataxConfig;

  let transactionDetails = cachedValue?.avataxTransaction;

  if (!transactionDetails) {
    const detailsService = new AvataxTransactionDetailsFetcher(new AvataxSdkClientFactory());

    try {
      transactionDetails = await detailsService.fetchTransactionDetails({
        isSandbox: thisConfig.isSandbox,
        credentials: thisConfig.credentials,
        transactionCode: avataxId,
        companyCode: thisConfig.companyCode,
      });
    } catch (e) {
      logger.error("Failed to fetch AvaTax transaction details", {
        error: e,
        orderId,
        avataxId,
      });

      return new Response("Failed to fetch AvaTax transaction details", { status: 502 });
    }

    addToCache(cacheKeySet, { avataxTransaction: transactionDetails });
  }

  return Response.json({
    applicable: true,
    exemptNo: transactionDetails.exemptNo ?? "",
    totalExempt: transactionDetails.totalExempt?.toString() ?? "",
    totalTaxable: transactionDetails.totalTaxable?.toString() ?? "",
  } satisfies OrderDetailsResponse);
};

export const GET = orderDetailsHandler;
