import { type Client } from "urql";

import { VariantsAvailabilityDocument } from "../../../generated/graphql";
import { createLogger } from "../logger";
import { createTraceEffect } from "../trace-effect";

const logger = createLogger("variantsAvailability");

const traceFetchAvailability = createTraceEffect({ name: "Saleor fetchVariantsAvailability" });

/**
 * Saleor allows fetching max 100 nodes in a single connection query.
 */
const PAGE_SIZE = 100;

/**
 * quantityAvailable per channel slug, per variant ID.
 */
export type VariantsAvailability = Record<string, Record<string, number | null>>;

export type FetchVariantsAvailability = (args: {
  variantIds: string[];
  channelSlugs: string[];
}) => Promise<VariantsAvailability>;

const chunk = <T>(items: T[], size: number): T[][] => {
  const chunks: T[][] = [];

  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }

  return chunks;
};

/**
 * `ProductVariant.quantityAvailable` is resolved per channel. Webhook subscriptions have no channel
 * context (`productVariant` is resolved with `channel_slug=None`), so the value in the payload is
 * always 0 - which would index every variant as out of stock.
 *
 * Saleor issue: https://github.com/saleor/saleor/issues/14748
 *
 * This fetches the field again, once per channel, so each Algolia index gets the value for its own channel.
 */
export const createVariantsAvailabilityFetcher =
  (apiClient: Pick<Client, "query">): FetchVariantsAvailability =>
  async ({ variantIds, channelSlugs }) => {
    const uniqueVariantIds = [...new Set(variantIds)];
    const uniqueChannelSlugs = [...new Set(channelSlugs)];

    if (!uniqueVariantIds.length || !uniqueChannelSlugs.length) {
      return {};
    }

    const results = await Promise.all(
      uniqueChannelSlugs.flatMap((channel) =>
        chunk(uniqueVariantIds, PAGE_SIZE).map(async (ids) => {
          const response = await traceFetchAvailability(
            () =>
              apiClient
                .query(VariantsAvailabilityDocument, { ids, channel, first: PAGE_SIZE })
                .toPromise(),
            { channel, variantsCount: ids.length },
          );

          if (response.error) {
            /**
             * Fail the webhook instead of writing a wrong value. Saleor will retry the delivery.
             */
            throw new Error(
              `Failed to fetch variants availability for channel "${channel}": ${response.error.message}`,
              { cause: response.error },
            );
          }

          const byVariantId: Record<string, number | null> = {};

          response.data?.productVariants?.edges.forEach(({ node }) => {
            byVariantId[node.id] = node.quantityAvailable ?? null;
          });

          return { channel, byVariantId };
        }),
      ),
    );

    const availability = results.reduce<VariantsAvailability>((acc, { channel, byVariantId }) => {
      acc[channel] = { ...acc[channel], ...byVariantId };

      return acc;
    }, {});

    logger.debug("Fetched variants availability", {
      channels: uniqueChannelSlugs,
      variantsCount: uniqueVariantIds.length,
    });

    return availability;
  };
