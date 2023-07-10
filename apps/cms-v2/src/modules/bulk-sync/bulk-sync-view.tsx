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
          <Button onClick={() => setStarted(true)}>Prefetch products</Button>
        </Box>
      )}
      {productsStatusList && <VariantsSyncStatusList marginTop={8} variants={productsStatusList} />}
    </Box>
  );
};

const FetchProductsStep = (props: { onButtonClick(): void }) => {
  return (
    <Box>
      <Text variant="heading" as="h2" marginBottom={4}>
        Saleor products fetch
      </Text>
      <Text as="p">Click the button to start fetching products from Saleor API</Text>
      <Text as="p">After products are fetched, you will be able to upload them to the CMS</Text>
      <Box display="flex" justifyContent="flex-end">
        <Button onClick={props.onButtonClick}>Prefetch products</Button>
      </Box>
    </Box>
  );
};

const SaleorProductsFetchingStep = () => {
  return (
    <Box>
      <Text variant="heading" as="h2" marginBottom={4}>
        Saleor products fetch
      </Text>
      <Text as="p">Fetching...</Text>
    </Box>
  );
};

const SaleorProductsFetchedStep = (props: { productsNo: number; variantsNo: number }) => {
  return (
    <Box>
      <Text variant="heading" as="h2" marginBottom={4}>
        Saleor products fetch
      </Text>
      <Text as="p">
        Fetched {props.productsNo} products and {props.variantsNo} variants
      </Text>
    </Box>
  );
};

type State = "initial" | "fetching" | "fetched" | "uploading";

export const BulkSyncView = ({
  configuration,
  connection,
}: {
  configuration: AnyProviderConfigSchemaType;
  connection: ChannelProviderConnectionType;
}) => {
  const [state, setState] = useState<State>("initial");

  const { products, finished: saleorProductsFetchFinished } = useFetchAllProducts(
    state === "fetching",
    connection.channelSlug
  );

  const { productsStatusList, setInitialProducts, setItemStatus } = useBulkSyncProductsState();

  useEffect(() => {
    if (!saleorProductsFetchFinished) {
      return;
    }

    setInitialProducts(products);
    setState("fetched");
  }, [products, saleorProductsFetchFinished, setInitialProducts]);

  return (
    <Box>
      <Text marginBottom={8} as="h1" variant="hero">
        Products bulk synchronization
      </Text>

      <AppSection
        marginBottom={8}
        mainContent={(() => {
          switch (state) {
            case "initial": {
              return (
                <FetchProductsStep
                  onButtonClick={() => {
                    setState("fetching");
                  }}
                />
              );
            }
            case "fetching": {
              return <SaleorProductsFetchingStep />;
            }

            case "fetched":
            case "uploading": {
              return (
                <SaleorProductsFetchedStep
                  productsNo={products.length}
                  variantsNo={productsStatusList?.length ?? 0}
                />
              );
            }
          }
        })()}
        heading="1. Fetch products"
        sideContent={
          <Text>First pre-fetch all Product Variants from Saleor. Do not close the app.</Text>
        }
      />

      {(state === "fetched" || state === "uploading") && productsStatusList && (
        <AppSection
          heading="Upload to the CMS"
          mainContent={
            <Box>
              <Text as="h2" marginBottom={4} variant="heading">
                Upload products
              </Text>
              {state === "fetched" && (
                <Box marginBottom={4}>
                  <Text as="p" marginBottom={2}>
                    Verify products below and click the button to start uploading.
                  </Text>
                  <Button onClick={() => setState("uploading")}>Start uploading</Button>
                </Box>
              )}
              <VariantsSyncStatusList marginTop={8} variants={productsStatusList} />
            </Box>
          }
        />
      )}
    </Box>
  );
};

// todo add zod resolvers to every form
