"use server";

import request from "graphql-request";
import { z } from "zod";

import { graphql, readFragment } from "@/graphql/gql";
import { envUrlSchema } from "@/lib/env-url";
import { BaseError, UnknownError } from "@/lib/errors";
import { actionClient } from "@/lib/safe-action";
import { saleorRequestHeaders } from "@/lib/saleor-request-headers";

import { ProductFragment } from "../fragments";

const FetchProductQuery = graphql(
  `
    query FetchProduct($channelSlug: String!, $search: String, $after: String) {
      products(
        first: 20
        after: $after
        channel: $channelSlug
        filter: { isPublished: true, stockAvailability: IN_STOCK, giftCard: false, search: $search }
        sortBy: { field: NAME, direction: ASC }
      ) {
        pageInfo {
          endCursor
          hasNextPage
        }
        edges {
          node {
            ...Product
          }
        }
      }
    }
  `,
  [ProductFragment],
);

const NoProductsFoundError = BaseError.subclass("NoProductsFoundError");

export const fetchProduct = actionClient
  .schema(
    z.object({
      envUrl: envUrlSchema,
      channelSlug: z.string(),
      search: z.string().optional(),
      after: z.string().optional(),
    }),
  )
  .metadata({ actionName: "fetchProduct" })
  .action(async ({ parsedInput: { channelSlug, envUrl, search, after } }) => {
    const response = await request(
      envUrl,
      FetchProductQuery,
      {
        channelSlug,
        search,
        after,
      },
      saleorRequestHeaders,
    ).catch((error) => {
      throw BaseError.normalize(error, UnknownError);
    });

    const products = response.products?.edges.map((edge) =>
      readFragment(ProductFragment, edge.node),
    );

    if (!products?.length && !after) {
      throw new NoProductsFoundError(
        "No matching products found for this channel. Try another search.",
      );
    }

    return response;
  });
