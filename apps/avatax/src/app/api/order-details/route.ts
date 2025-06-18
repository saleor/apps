import { verifyJWT } from "@saleor/app-sdk/auth";
import { createGraphQLClient } from "@saleor/apps-shared/create-graphql-client";
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

const orderDetailsHandler = async (req: NextRequest) => {
  const body = await req.formData();

  // ExtensionPOSTAttributes structure
  const orderId = body.get("orderId") as string;
  const saleorApiUrl = body.get("saleorApiUrl") as string;
  const accessToken = body.get("accessToken") as string;
  const appId = body.get("appId") as string;

  try {
    await verifyJWT({
      token: accessToken,
      appId: appId,
      saleorApiUrl: saleorApiUrl,
    });
  } catch (e) {
    return new Response("Not authorized, please refresh the page and try again.", {
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
      status: 400,
    });
  }

  const avataxId = orderMetadata.data?.order?.avataxId;

  if (!avataxId) {
    return new Response("Missing avatax ID in metadata", {
      status: 400,
    });
  }

  const channelSlug = orderMetadata.data!.order!.channel.slug;

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

  console.log({ avataxId });

  const transactionDetails = await detailsService.fetchTransactionDetails({
    isSandbox: thisConfig.isSandbox,
    credentials: thisConfig.credentials,
    transactionCode: avataxId,
    companyCode: thisConfig.companyCode,
  });

  console.log(transactionDetails);

  return new Response("wip");
};

export const POST = orderDetailsHandler;
