type ChannelListing = Record<string, any> & {
  channel: {
    slug: string;
  };
};

export const getChannelsSlugsFromSaleorItem = (
  item?: { channelListings?: ChannelListing[] | null } | null
) => {
  return item?.channelListings?.map((cl) => cl.channel.slug) || [];
};
