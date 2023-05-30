import { GraphqlClientFactory } from "../../lib/create-graphq-client";
import { updateCacheForConfigurations } from "./update-cache-for-configurations";
import { AuthData } from "@saleor/app-sdk/APL";
import {
  ProductVariantWebhookPayloadFragment,
  ProductWebhookPayloadFragment,
} from "../../../generated/graphql";
import { NextApiResponse } from "next";

type ChannelFragment =
  | Pick<ProductWebhookPayloadFragment, "channel" | "channelListings">
  | Pick<ProductVariantWebhookPayloadFragment, "channel" | "channelListings">;

export const updateCacheOnWebhook = async ({
  channels,
  authData,
  res,
}: {
  authData: AuthData;
  channels: ChannelFragment;
  res: NextApiResponse;
}) => {
  const client = GraphqlClientFactory.fromAuthData(authData);

  const channelsSlugs = [
    channels.channel,
    ...(channels.channelListings?.map((cl) => cl.channel.slug) ?? []),
  ].filter((c) => c) as string[];

  if (channelsSlugs.length === 0) {
    return res.status(200).end();
  }

  await updateCacheForConfigurations({
    channelsSlugs,
    client,
    saleorApiUrl: authData.saleorApiUrl,
  });

  return res.status(200).end();
};
