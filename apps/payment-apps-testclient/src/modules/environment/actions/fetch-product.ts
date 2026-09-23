"use server";

import request from "graphql-request";
import { z } from "zod";

import { graphql, readFragment } from "@/graphql/gql";
import { envUrlSchema } from "@/lib/env-url";
import { BaseError, UnknownError } from "@/lib/errors";
import { actionClient } from "@/lib/safe-action";

import { ProductFragment } from "../fragments";

const FetchProductQuery = graphql(
  `
    query FetchProduct($channelSlug: String!) {
      products(
        first: 1
        channel: $channelSlug
        filter: { isPublished: true, stockAvailability: IN_STOCK, giftCard: false }
        sortBy: { field: PRICE, direction: DESC }
      ) {
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
const DefaultVariantNotAvailableError = BaseError.subclass("DefaultVariantNotAvailableError");

export const fetchProduct = actionClient
  .schema(
    z.object({
      envUrl: envUrlSchema,
      channelSlug: z.string(),
    }),
  )
  .metadata({ actionName: "fetchProduct" })
  .action(async ({ parsedInput: { channelSlug, envUrl } }) => {
    const response = await request(envUrl, FetchProductQuery, {
      channelSlug,
    }).catch((error) => {
      throw BaseError.normalize(error, UnknownError);
    });

    const products = response.products?.edges.map((edge) =>
      readFragment(ProductFragment, edge.node),
    );

    if (products?.length === 0) {
      throw new NoProductsFoundError("No products found for selected channel.");
    }

    if (products?.some((product) => product.defaultVariant?.pricing === null)) {
      throw new DefaultVariantNotAvailableError(
        "Default variant not available for selected channel.",
      );
    }

    return response;
  });
