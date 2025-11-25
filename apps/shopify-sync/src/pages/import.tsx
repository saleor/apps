import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Box, Button, Select, Text } from "@saleor/macaw-ui";
import { NextPage } from "next";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { trpcClient } from "@/modules/trpc/trpc-client";

const ImportPage: NextPage = () => {
  const { appBridgeState } = useAppBridge();
  const [isReady, setIsReady] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<string>("");

  const { data: config, isLoading: isConfigLoading } = trpcClient.config.get.useQuery(undefined, {
    enabled: isReady && !!appBridgeState?.ready,
  });

  const { data: channels, isLoading: isChannelsLoading } = trpcClient.sync.getChannels.useQuery(
    undefined,
    {
      enabled: isReady && !!appBridgeState?.ready && !!config?.isConfigured,
    }
  );

  const importMutation = trpcClient.sync.importFromShopify.useMutation();

  useEffect(() => {
    if (appBridgeState?.ready) {
      setIsReady(true);
    }
  }, [appBridgeState?.ready]);

  useEffect(() => {
    if (channels && channels.length > 0 && !selectedChannel) {
      setSelectedChannel(channels[0].slug);
    }
  }, [channels, selectedChannel]);

  const handleImport = useCallback(() => {
    if (selectedChannel) {
      importMutation.mutate({ channelSlug: selectedChannel });
    }
  }, [selectedChannel, importMutation]);

  if (!appBridgeState?.ready || isConfigLoading) {
    return (
      <Box padding={8}>
        <Text>Loading...</Text>
      </Box>
    );
  }

  if (!config?.isConfigured) {
    return (
      <Box padding={8} display="flex" flexDirection="column" gap={4}>
        <Text as="h1" size={7} fontWeight="bold">
          Import from Shopify
        </Text>
        <Text color="critical1">
          Please configure Shopify connection first.
        </Text>
        <Link href="/">
          <Button variant="secondary">Go to Configuration</Button>
        </Link>
      </Box>
    );
  }

  const channelOptions = channels?.map((c) => ({
    value: c.slug,
    label: `${c.name} (${c.currencyCode})`,
  })) ?? [];

  return (
    <Box padding={8} display="flex" flexDirection="column" gap={6}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Text as="h1" size={7} fontWeight="bold">
            Import from Shopify
          </Text>
          <Text color="default2">
            Import products from your Shopify store to Saleor
          </Text>
        </Box>
        <Link href="/">
          <Button variant="tertiary">Back to Configuration</Button>
        </Link>
      </Box>

      <Box
        display="flex"
        flexDirection="column"
        gap={4}
        __maxWidth="600px"
        padding={6}
        borderWidth={1}
        borderStyle="solid"
        borderColor="default1"
        borderRadius={4}
      >
        <Text as="h2" size={5} fontWeight="medium">
          Import Settings
        </Text>

        <Box display="flex" flexDirection="column" gap={2}>
          <Text as="p" fontWeight="medium">
            Target Channel
          </Text>
          <Select
            value={selectedChannel}
            onChange={(value) => setSelectedChannel(value as string)}
            options={channelOptions}
            disabled={isChannelsLoading}
          />
          <Text size={1} color="default2">
            Products will be imported and published to this channel
          </Text>
        </Box>

        <Button
          onClick={handleImport}
          disabled={!selectedChannel || importMutation.isLoading}
        >
          {importMutation.isLoading ? "Importing..." : "Start Import"}
        </Button>

        {importMutation.isSuccess && (
          <Box
            padding={4}
            backgroundColor="success1"
            borderRadius={4}
          >
            <Text as="h3" size={4} fontWeight="medium" marginBottom={2}>
              Import Complete
            </Text>
            <Box display="flex" flexDirection="column" gap={1}>
              <Text>Imported: {importMutation.data.imported}</Text>
              <Text>Updated: {importMutation.data.updated}</Text>
              <Text>Failed: {importMutation.data.failed}</Text>
            </Box>
            {importMutation.data.errors.length > 0 && (
              <Box marginTop={2}>
                <Text fontWeight="bold">
                  Errors:
                </Text>
                {importMutation.data.errors.map((e, i) => (
                  <Text key={i} color="critical1">
                    {e.productName}: {e.error}
                  </Text>
                ))}
              </Box>
            )}
          </Box>
        )}

        {importMutation.isError && (
          <Box padding={4} backgroundColor="critical1" borderRadius={4}>
            <Text color="critical1">
              Import failed: {importMutation.error.message}
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ImportPage;
