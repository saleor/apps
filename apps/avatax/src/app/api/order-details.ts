import { verifyJWT } from "@saleor/app-sdk/auth";
import { ExtensionPOSTAttributes } from "@saleor/app-sdk/types";
import { createGraphQLClient } from "@saleor/apps-shared/create-graphql-client";
import { NextApiHandler } from "next";
import { NextRequest } from "next/server";

import { metadataCache } from "@/lib/app-metadata-cache";
import { createSettingsManager } from "@/modules/app/metadata-manager";
import { AvataxConnectionService } from "@/modules/avatax/configuration/avatax-connection.service";
import { AvataxConnectionRepository } from "@/modules/avatax/configuration/avatax-connection-repository";
import { CrudSettingsManager } from "@/modules/crud-settings/crud-settings.service";
import { TAX_PROVIDER_KEY } from "@/modules/provider-connections/public-provider-connections.service";

import { OrderAvataxIdDocument } from "../../../generated/graphql";

const orderDetailsHandler = async (req: NextRequest) => {
  const body = (await req.json()) as ExtensionPOSTAttributes;

  console.log(body);

  try {
    await verifyJWT({
      token: body.accessToken,
      appId: body.appId,
      saleorApiUrl: body.saleorApiUrl,
    });
  } catch (e) {
    return new Response("Not authorized, please refresh the page and try again.", {
      status: 401,
    });
  }

  if (!body.orderId) {
    return new Response("Order ID is missing", {
      status: 400,
    });
  }

  const client = createGraphQLClient({ token: body.accessToken, saleorApiUrl: body.saleorApiUrl });

  const orderMetadata = await client.query(OrderAvataxIdDocument, {
    id: body.orderId,
  });

  if (orderMetadata.error) {
    return new Response("Failed to fetch order", {
      status: 400,
    });
  }

  const channelSlug = orderMetadata.data!.order!.channel.slug;

  const settingsManager = createSettingsManager(client, body.appId, metadataCache);

  const connService = new AvataxConnectionService(
    new AvataxConnectionRepository(
      new CrudSettingsManager({
        saleorApiUrl: body.saleorApiUrl,
        metadataKey: TAX_PROVIDER_KEY,
        metadataManager: settingsManager,
      }),
    ),
  );

  const all = await connService.getAll();

  console.log(all);
};

export const POST = orderDetailsHandler;
