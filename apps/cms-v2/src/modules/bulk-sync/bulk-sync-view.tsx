import { useDashboardNotification } from "@saleor/apps-shared";
import { Breadcrumbs, ButtonsBox, Layout } from "@saleor/apps-ui";
import { ArrowRightIcon, Box, Button, Text } from "@saleor/macaw-ui";
import { useEffect, useRef, useState } from "react";

import { ChannelProviderConnectionConfig, ProvidersConfig } from "../configuration";
import { ProvidersResolver } from "../providers/providers-resolver";
import { AppHeader } from "../ui/app-header";
import { useBulkSyncProductsState } from "./use-bulk-sync-products-state";
import { useFetchAllProducts } from "./use-fetch-all-products";
import { VariantsSyncStatusList } from "./variants-sync-status-list";

const FetchProductsStep = (props: { onButtonClick(): void }) => {
  return (
    <Layout.AppSectionCard
      footer={
        <ButtonsBox>
          <Button onClick={props.onButtonClick}>Prefetch products</Button>
        </ButtonsBox>
      }
    >
      <Text size={5} fontWeight="bold" as="h2" marginBottom={4}>
        Saleor products fetch
      </Text>
      <Text as="p">Click the button to start fetching products from Saleor API</Text>
      <Text as="p">After products are fetched, you will be able to upload them to the CMS</Text>
    </Layout.AppSectionCard>
  );
};

const SaleorProductsFetchingStep = () => {
  return (
    <Box>
      <Text size={5} fontWeight="bold" as="h2" marginBottom={4}>
        Saleor products fetch
      </Text>
      <Text as="p">Fetching...</Text>
    </Box>
  );
};

const SaleorProductsFetchedStep = (props: { productsNo: number; variantsNo: number }) => {
  return (
    <Box>
      <Text size={5} fontWeight="bold" as="h2" marginBottom={4}>
        Saleor products fetch
      </Text>
      <Text as="p">
        Fetched {props.productsNo} products and {props.variantsNo} variants
      </Text>
    </Box>
  );
};

type Status = "initial" | "fetching" | "fetched" | "uploading";

export const BulkSyncView = ({
  configuration,
  connection,
}: {
  configuration: ProvidersConfig.AnyFullShape;
  connection: ChannelProviderConnectionConfig.FullShape;
}) => {
  const processor = useRef(ProvidersResolver.createBulkSyncProcessor(configuration));
  const [state, setState] = useState<Status>("initial");
  const { notifySuccess } = useDashboardNotification();

  const { products, finished: saleorProductsFetchFinished } = useFetchAllProducts(
    state === "fetching",
    connection.channelSlug,
  );

  const { productsStatusList, setInitialProducts, setItemStatus, finished } =
    useBulkSyncProductsState();

  useEffect(() => {
    if (finished) {
      notifySuccess("Bulk sync ended", "All products have been synced, please verify results");
    }
  }, [finished, notifySuccess]);

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
        // User will be notified about the error in the UI
        setItemStatus(variantId, "error");
      },
    });
  }, [state, products, configuration, setItemStatus]);

  return (
    <Box>
      <AppHeader
        text="Perform bulk products sync between Saleor and your CMS"
        breadcrumbs={[
          <Breadcrumbs.Item key="bulk-sync">Bulk Sync</Breadcrumbs.Item>,
          <Breadcrumbs.Item key="connection-name">
            <Box display="flex" gap={2} alignItems="center">
              {connection.channelSlug}
              <ArrowRightIcon /> {configuration.configName}
            </Box>
          </Breadcrumbs.Item>,
        ]}
      />

      <Layout.AppSection
        marginBottom={8}
        heading="1. Fetch products"
        sideContent={
          <Text>First pre-fetch all Product Variants from Saleor. Do not close the app.</Text>
        }
      >
        {(() => {
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
      </Layout.AppSection>

      {(state === "fetched" || state === "uploading") && productsStatusList && (
        <Layout.AppSection
          marginTop={14}
          heading="2. Upload to the CMS"
          sideContent={<Text>Send listed variants to the CMS</Text>}
        >
          <Layout.AppSectionCard>
            <Text as="h2" marginBottom={4} size={5} fontWeight="bold">
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
          </Layout.AppSectionCard>
        </Layout.AppSection>
      )}
    </Box>
  );
};
