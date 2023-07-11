import { Box, Button, Text } from "@saleor/macaw-ui/next";
import { useEffect, useState } from "react";
import { AnyProviderConfigSchemaType, ChannelProviderConnectionType } from "../configuration";
import { ContentfulClient } from "../contentful/contentful-client";
import { contentfulRateLimiter } from "../contentful/contentful-rate-limiter";
import { AppSection } from "../ui/app-section";
import { useBulkSyncProductsState } from "./use-bulk-sync-products-state";
import { useFetchAllProducts } from "./use-fetch-all-products";
import { VariantsSyncStatusList } from "./variants-sync-status-list";
import { Breadcrumbs } from "@saleor/apps-ui";
import { ArrowRightIcon } from "@saleor/macaw-ui";
import { ButtonsBox } from "../ui/buttons-box";

const FetchProductsStep = (props: { onButtonClick(): void }) => {
  return (
    <Box>
      <Text variant="heading" as="h2" marginBottom={4}>
        Saleor products fetch
      </Text>
      <Text as="p">Click the button to start fetching products from Saleor API</Text>
      <Text as="p">After products are fetched, you will be able to upload them to the CMS</Text>
      <ButtonsBox>
        <Button onClick={props.onButtonClick}>Prefetch products</Button>
      </ButtonsBox>
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

  useEffect(() => {
    if (state !== "uploading") {
      return;
    }

    // todo make abstraction

    const contentful = new ContentfulClient({
      accessToken: configuration.authToken,
      space: configuration.spaceId,
    });

    products.flatMap((product) => {
      return product.variants?.map((variant) => {
        return contentfulRateLimiter(() => {
          setItemStatus(variant.id, "uploading");

          return contentful
            .upsertProduct({
              configuration,
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
  }, [state, products, configuration, setItemStatus]);

  return (
    <Box>
      <Breadcrumbs marginBottom={8}>
        <Breadcrumbs.Item>Saleor App CMS</Breadcrumbs.Item>
        <Breadcrumbs.Item href="/configuration">Configuration</Breadcrumbs.Item>
        <Breadcrumbs.Item>Bulk Sync</Breadcrumbs.Item>
        <Breadcrumbs.Item>
          <Box display="flex" gap={2} alignItems="center">
            {connection.channelSlug}
            <ArrowRightIcon /> {configuration.configName}
          </Box>
        </Breadcrumbs.Item>
      </Breadcrumbs>

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
          heading="2. Upload to the CMS"
          sideContent={<Text>Send listed variants to the CMS</Text>}
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
