import { Box, Button, Text } from "@saleor/macaw-ui/next";
import { useEffect, useState } from "react";
import {
  AnyProviderConfigSchemaType,
  ChannelProviderConnectionType,
  RootConfigSchemaType,
} from "../configuration";
import { ContentfulClient } from "../contentful/contentful-client";
import { contentfulRateLimiter } from "../contentful/contentful-rate-limiter";
import { trpcClient } from "../trpc/trpc-client";
import { AppSection } from "../ui/app-section";
import { useBulkSyncProductsState } from "./use-bulk-sync-products-state";
import { useFetchAllProducts } from "./use-fetch-all-products";
import { VariantsSyncStatusList } from "./variants-sync-status-list";

const Results = (props: {
  channelSlug: string;
  providerConfig: RootConfigSchemaType["providers"][0];
}) => {
  const [started, setStarted] = useState(false);

  const { products, finished } = useFetchAllProducts(started, props.channelSlug);

  const { productsStatusList, setInitialProducts, setItemStatus } = useBulkSyncProductsState();

  useEffect(() => {
    if (!finished) {
      return;
    }

    setInitialProducts(products);
  }, [products, finished, setInitialProducts]);

  useEffect(() => {
    if (!finished) {
      return;
    }

    // todo make abstraction

    const contentful = new ContentfulClient({
      accessToken: props.providerConfig.authToken,
      space: props.providerConfig.spaceId,
    });

    const promises = products.flatMap((product) => {
      return product.variants?.map((variant) => {
        return contentfulRateLimiter(() => {
          setItemStatus(variant.id, "uploading");

          return contentful
            .upsertProduct({
              configuration: props.providerConfig,
              variant: {
                id: variant.id,
                name: variant.name,
                channelListings: variant.channelListings,
                product: {
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                },
              },
            })
            .then((r) => {
              if (r?.metadata) {
                setItemStatus(variant.id, "success");
              }
            })
            .catch((e) => {
              console.error(e);

              setItemStatus(variant.id, "error");
            });
        });
      });
    });

    Promise.all(promises).then(() => {
      console.log("all");
    });
  }, [finished, products]);

  return (
    <Box>
      {!started && (
        <Box display="flex" justifyContent="flex-end">
          <Button onClick={() => setStarted(true)}>Start sync</Button>
        </Box>
      )}
      {productsStatusList && <VariantsSyncStatusList marginTop={8} variants={productsStatusList} />}
    </Box>
  );
};

export const BulkSyncView = ({
  configuration,
  connection,
}: {
  configuration: AnyProviderConfigSchemaType;
  connection: ChannelProviderConnectionType;
}) => {
  return (
    <Box>
      <Text marginBottom={8} as="h1" variant="hero">
        Products bulk synchronization
      </Text>

      <AppSection
        mainContent={
          <Results channelSlug={connection.channelSlug} providerConfig={configuration} />
        }
        heading="1. Fetch products"
        sideContent={
          <Text>First pre-fetch all Product Variants from Saleor. Do not close the app.</Text>
        }
      />
    </Box>
  );
};

// todo add zod resolvers to every form
