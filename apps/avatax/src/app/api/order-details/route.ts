import { verifyJWT } from "@saleor/app-sdk/auth";
import { ExtensionPOSTAttributes } from "@saleor/app-sdk/types";
import { createGraphQLClient } from "@saleor/apps-shared/create-graphql-client";
import { TransactionModel } from "avatax/lib/models/TransactionModel";
import { NextRequest } from "next/server";

import { metadataCache } from "@/lib/app-metadata-cache";
import { createSettingsManager } from "@/modules/app/metadata-manager";
import { AvataxConfig } from "@/modules/avatax/avatax-connection-schema";
import { AvataxSdkClientFactory } from "@/modules/avatax/avatax-sdk-client-factory";
import { AvataxTransactionDetailsFetcher } from "@/modules/avatax/avatax-transaction-details-fetcher";
import { CrudSettingsManager } from "@/modules/crud-settings/crud-settings.service";
import { TAX_PROVIDER_KEY } from "@/modules/provider-connections/public-provider-connections.service";

import { OrderAvataxIdDocument } from "../../../../generated/graphql";
import { apl } from "../../../../saleor-app";

const getFieldsFromRequest = async (req: NextRequest) => {
  const body = await req.formData();

  return {
    orderId: body.get("orderId") as string | undefined,
    saleorApiUrl: body.get("saleorApiUrl") as string,
    accessToken: body.get("accessToken") as string,
    appId: body.get("appId") as string,
  } satisfies ExtensionPOSTAttributes;
};

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

// todo add caching on http. Probably we need to add stuff to GET for that
const orderDetailsHandler = async (req: NextRequest) => {
  const { orderId, saleorApiUrl, appId, accessToken } = await getFieldsFromRequest(req);

  try {
    await verifyJWT({
      token: accessToken,
      appId: appId,
      saleorApiUrl: saleorApiUrl,
    });
  } catch (e) {
    return new Response("Failed to verify JWT", {
      status: 401,
    });
  }

  if (!orderId) {
    return new Response("Order ID is missing", {
      status: 400,
    });
  }

  const authData = await apl.get(saleorApiUrl);

  if (!authData) {
    return new Response("Not authorized", {
      status: 401,
    });
  }

  const client = createGraphQLClient({ token: authData.token, saleorApiUrl: saleorApiUrl });

  const orderMetadata = await client.query(OrderAvataxIdDocument, {
    id: orderId,
  });

  if (orderMetadata.error) {
    return new Response("Failed to fetch order", {
      // Accept retrying if Saleor failed to answer
      status: 500,
    });
  }

  const avataxId = orderMetadata.data?.order?.avataxId;

  if (!avataxId) {
    return new Response("AvaTax was not used for this order", {
      status: 202,
    });
  }

  if (!orderMetadata.data?.order) {
    return new Response("Order can't be resolved", {
      status: 202,
    });
  }

  const cachedValue = getFromCache({ saleorApiUrl, appId, orderId, avataxId });

  const channelSlug = orderMetadata.data.order.channel.slug;

  const settingsManager = createSettingsManager(client, appId, metadataCache);

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

  const detailsService = new AvataxTransactionDetailsFetcher(new AvataxSdkClientFactory());

  const transactionDetails =
    cachedValue?.avataxTransaction ??
    (await detailsService.fetchTransactionDetails({
      isSandbox: thisConfig.isSandbox,
      credentials: thisConfig.credentials,
      transactionCode: avataxId,
      companyCode: thisConfig.companyCode,
    }));

  addToCache(
    {
      appId,
      orderId,
      avataxId,
      saleorApiUrl,
    },
    {
      avataxTransaction: transactionDetails,
    },
  );

  const meaningfulFields = {
    exemptNo: transactionDetails.exemptNo ?? "",
    totalExempt: transactionDetails.totalExempt?.toString() ?? "",
    totalTaxable: transactionDetails.totalTaxable?.toString() ?? "",
    /*
     * todo print taxable and non-taxable lines
     * todo add link to avalara dashboard
     */
  };

  const qs = new URLSearchParams(meaningfulFields);

  // in localhost you may need to replace to http
  const result = await fetch(new URL("/order-details?" + qs.toString(), req.url));

  return new Response(await result.text(), {
    headers: {
      "Content-Type": "text/html",
    },
  });
};

export const POST = orderDetailsHandler;
