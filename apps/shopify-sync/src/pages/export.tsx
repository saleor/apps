import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Box, Button, Select, Text } from "@saleor/macaw-ui";
import { NextPage } from "next";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { trpcClient } from "@/modules/trpc/trpc-client";

const ExportPage: NextPage = () => {
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

  const exportMutation = trpcClient.sync.exportToShopify.useMutation();

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

  const handleExport = useCallback(() => {
    if (selectedChannel) {
      exportMutation.mutate({ channelSlug: selectedChannel });
    }
  }, [selectedChannel, exportMutation]);

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
          Export to Shopify
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
            Export to Shopify
          </Text>
          <Text color="default2">
            Export products from Saleor to your Shopify store
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
          Export Settings
        </Text>

        <Box display="flex" flexDirection="column" gap={2}>
          <Text as="p" fontWeight="medium">
            Source Channel
          </Text>
          <Select
            value={selectedChannel}
            onChange={(value) => setSelectedChannel(value as string)}
            options={channelOptions}
            disabled={isChannelsLoading}
          />
          <Text size={1} color="default2">
            Products from this channel will be exported to Shopify
          </Text>
        </Box>

        <Button
          onClick={handleExport}
          disabled={!selectedChannel || exportMutation.isLoading}
        >
          {exportMutation.isLoading ? "Exporting..." : "Start Export"}
        </Button>

        {exportMutation.isSuccess && (
          <Box
            padding={4}
            backgroundColor="success1"
            borderRadius={4}
          >
            <Text as="h3" size={4} fontWeight="medium" marginBottom={2}>
              Export Complete
            </Text>
            <Box display="flex" flexDirection="column" gap={1}>
              <Text>Exported: {exportMutation.data.exported}</Text>
              <Text>Updated: {exportMutation.data.updated}</Text>
              <Text>Failed: {exportMutation.data.failed}</Text>
            </Box>
            {exportMutation.data.errors.length > 0 && (
              <Box marginTop={2}>
                <Text fontWeight="bold">
                  Errors:
                </Text>
                {exportMutation.data.errors.map((e, i) => (
                  <Text key={i} color="critical1">
                    {e.productName}: {e.error}
                  </Text>
                ))}
              </Box>
            )}
          </Box>
        )}

        {exportMutation.isError && (
          <Box padding={4} backgroundColor="critical1" borderRadius={4}>
            <Text color="critical1">
              Export failed: {exportMutation.error.message}
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ExportPage;
