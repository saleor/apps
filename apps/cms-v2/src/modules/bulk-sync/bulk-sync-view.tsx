import { Box, Button, Text, WarningIcon } from "@saleor/macaw-ui/next";
import { trpcClient } from "../trpc/trpc-client";
import { useFetchAllProducts } from "./use-fetch-all-products";
import { AppSection } from "../ui/app-section";
import { useEffect, useState } from "react";
import { RootConfigSchemaType } from "../configuration";
import { ContentfulClient } from "../contentful/contentful-client";
import { pRateLimit } from "p-ratelimit";
import { VariantsSyncStatusList, VariantsSyncStatusListItem } from "./variants-sync-status-list";

const Results = (props: {
  channelSlug: string;
  providerConfig: RootConfigSchemaType["providers"][0];
}) => {
  const [started, setStarted] = useState(false);

  const [productsStatusList, setProductsStatusList] = useState<VariantsSyncStatusListItem[] | null>(
    null
  );

  const { products, finished } = useFetchAllProducts(started, props.channelSlug, {
    onFinished(products) {},
    onBatchFetched(products) {},
    onPageStart(cursor) {},
  });

  useEffect(() => {
    if (!finished) {
      return;
    }

    setProductsStatusList(
      products.flatMap((p) => {
        console.log(p);

        const items: VariantsSyncStatusListItem[] =
          p.variants?.map((v) => ({
            productID: p.id,
            productName: p.name,
            status: "pending",
            variantId: v.id,
            variantName: v.name,
          })) ?? [];

        return items;
      })
    );
  }, [products, finished]);

  useEffect(() => {
    if (!finished) {
      return;
    }

    // todo make abstraction

    const contentful = new ContentfulClient({
      accessToken: props.providerConfig.authToken,
      space: props.providerConfig.spaceId,
    });

    const limit = pRateLimit({
      interval: 1000, // 1000 ms == 1 second
      rate: 2, // 5 API calls per interval
      concurrency: 2, // no more than 10 running at once
      // maxDelay: 5000, // an API call delayed > 2 sec is rejected
    });

    // todo rate limiting
    const promises = products.flatMap((product) => {
      return product.variants?.map((variant) => {
        return limit(() => {
          setProductsStatusList((items) =>
            items!.map((item) => {
              if (item.variantId === variant.id) {
                return {
                  ...item,
                  status: "uploading",
                };
              }

              return item;
            })
          );

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
                setProductsStatusList((items) =>
                  items!.map((item) => {
                    if (item.variantId === variant.id) {
                      return {
                        ...item,
                        status: "success",
                      };
                    }

                    return item;
                  })
                );
              }
            })
            .catch((e) => {
              console.error(e);

              setProductsStatusList((items) =>
                items!.map((item) => {
                  if (item.variantId === variant.id) {
                    return {
                      ...item,
                      status: "error",
                    };
                  }

                  return item;
                })
              );
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

export const BulkSyncView = (props: { connectionId: string }) => {
  const { data: connection } = trpcClient.channelsProvidersConnection.fetchConnection.useQuery({
    id: props.connectionId,
  });

  const { data: provider } = trpcClient.providersList.fetchConfiguration.useQuery(
    {
      id: connection?.providerId ?? "",
    },
    {
      enabled: !!connection,
    }
  );

  return (
    <Box>
      <Text marginBottom={4} as="h1" variant="hero">
        Products bulk synchronization
      </Text>

      {provider && connection && (
        <AppSection
          mainContent={<Results channelSlug={connection.channelSlug} providerConfig={provider} />}
          heading="Sync products"
        />
      )}
    </Box>
  );
};

// todo add zod resolvers to every form
