import { Box, Button, Text, WarningIcon } from "@saleor/macaw-ui/next";
import { trpcClient } from "../trpc/trpc-client";
import { useFetchAllProducts } from "./use-fetch-all-products";
import { AppSection } from "../ui/app-section";
import { useEffect, useState } from "react";
import { RootConfigSchemaType } from "../configuration";
import { ContentfulClient } from "../contentful/contentful-client";

const formatLog = (log: string) =>
  `${Intl.DateTimeFormat("en-US", { timeStyle: "medium" }).format(new Date())} - ${log}`;

const Results = (props: {
  channelSlug: string;
  providerConfig: RootConfigSchemaType["providers"][0];
}) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [fetchFinished, setFetchFinished] = useState(false);

  const addLog = (log: string) => setLogs((logs) => [...logs, formatLog(log)]);

  const [started, setStarted] = useState(false);
  const { products } = useFetchAllProducts(started, props.channelSlug, {
    onFinished() {
      console.log("finish");
      setStarted(false);

      addLog("Finished fetching all products for channel: " + props.channelSlug);

      setFetchFinished(true);
    },
    onBatchFetched(products) {
      const newLogs = products.map((p) => formatLog(`Fetched product: ${p.id} (${p.name})`));

      setLogs((logs) => [...logs, ...newLogs]);
    },
    onPageStart(cursor) {
      addLog(`Started fetching products page with cursor: ${cursor ?? "Empty"}`);
    },
  });

  useEffect(() => {
    if (!fetchFinished) {
      return;
    }

    // todo make abstraction

    const contentful = new ContentfulClient({
      accessToken: props.providerConfig.authToken,
      space: props.providerConfig.spaceId,
    });

    // todo rate limiting
    const promises = products.map((product) => {
      return product.variants?.map((variant) => {
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
              addLog(`✅ Uploaded variant ${variant.id}`);
            }
          })
          .catch((e) => {
            console.error(e);
            addLog(`❌ Failed to upload variant ${variant.id}`); //todo print error
          });
      });
    });

    Promise.all(promises).then(() => {
      addLog("Completed upload");
    });
  }, [fetchFinished, products]);

  return (
    <Box>
      {!started && (
        <Box display="flex" justifyContent="flex-end">
          <Button onClick={() => setStarted(true)}>Start sync</Button>
        </Box>
      )}
      {logs.length > 0 && (
        <Box>
          <Text as="p" marginBottom={4} variant="heading">
            Logs
          </Text>
          {logs.map((l) => (
            <Text style={{ fontFamily: "monospace" }} size="small" as="p" key={l}>
              {l}
            </Text>
          ))}
        </Box>
      )}
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
