import { Breadcrumbs } from "@saleor/apps-ui";
import { ArrowRightIcon, Box, Button, Text } from "@saleor/macaw-ui/next";
import { useEffect, useRef, useState } from "react";
import { AnyProviderConfigSchemaType, ChannelProviderConnectionType } from "../configuration";
import { AppSection } from "../ui/app-section";
import { ButtonsBox } from "../ui/buttons-box";
import { BulkSyncProcessorFactory } from "./bulk-sync-processor";
import { useBulkSyncProductsState } from "./use-bulk-sync-products-state";
import { useFetchAllProducts } from "./use-fetch-all-products";
import { VariantsSyncStatusList } from "./variants-sync-status-list";
import { AppHeader } from "../ui/app-header";

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
  const processor = useRef(BulkSyncProcessorFactory.create(configuration));
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

    processor.current.uploadProducts(products, {
      onUploadStart({ variantId }) {
        setItemStatus(variantId, "uploading");
      },
      onUploadSuccess({ variantId }) {
        setItemStatus(variantId, "success");
      },
      onUploadError({ error, variantId }) {
        // todo handle error
        setItemStatus(variantId, "error");
      },
    });
  }, [state, products, configuration, setItemStatus]);

  return (
    <Box>
      <AppHeader
        text="Perform bulk products sync between Saleor and your CMS"
        breadcrumbs={[
          <Breadcrumbs.Item>Bulk Sync</Breadcrumbs.Item>,
          <Breadcrumbs.Item>
            <Box display="flex" gap={2} alignItems="center">
              {connection.channelSlug}
              <ArrowRightIcon /> {configuration.configName}
            </Box>
          </Breadcrumbs.Item>,
        ]}
      />

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
