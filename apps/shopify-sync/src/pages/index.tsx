import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Box, Button, Input, Text } from "@saleor/macaw-ui";
import { NextPage } from "next";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { trpcClient } from "@/modules/trpc/trpc-client";

interface ConfigFormData {
  shopDomain: string;
  accessToken: string;
  apiVersion: string;
}

const IndexPage: NextPage = () => {
  const { appBridgeState } = useAppBridge();
  const [isReady, setIsReady] = useState(false);

  const { data: config, refetch } = trpcClient.config.get.useQuery(undefined, {
    enabled: isReady && !!appBridgeState?.ready,
  });

  const saveConfigMutation = trpcClient.config.save.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const deleteConfigMutation = trpcClient.config.delete.useMutation({
    onSuccess: () => {
      refetch();
      reset();
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ConfigFormData>({
    defaultValues: {
      shopDomain: "",
      accessToken: "",
      apiVersion: "2024-10",
    },
  });

  useEffect(() => {
    if (appBridgeState?.ready) {
      setIsReady(true);
    }
  }, [appBridgeState?.ready]);

  useEffect(() => {
    if (config) {
      reset({
        shopDomain: config.shopDomain,
        accessToken: "",
        apiVersion: config.apiVersion,
      });
    }
  }, [config, reset]);

  const onSubmit = useCallback(
    (data: ConfigFormData) => {
      saveConfigMutation.mutate(data);
    },
    [saveConfigMutation]
  );

  const handleDisconnect = useCallback(() => {
    deleteConfigMutation.mutate();
  }, [deleteConfigMutation]);

  if (!appBridgeState?.ready) {
    return (
      <Box padding={8}>
        <Text>Loading...</Text>
      </Box>
    );
  }

  return (
    <Box padding={8} display="flex" flexDirection="column" gap={6}>
      <Box>
        <Text as="h1" size={7} fontWeight="bold">
          Shopify Sync
        </Text>
        <Text color="default2">
          Sync products between Shopify and Saleor stores
        </Text>
      </Box>

      <Box
        as="form"
        onSubmit={handleSubmit(onSubmit)}
        display="flex"
        flexDirection="column"
        gap={4}
        __maxWidth="600px"
      >
        <Text as="h2" size={5} fontWeight="medium">
          Shopify Connection
        </Text>

        <Box display="flex" flexDirection="column" gap={2}>
          <Input
            label="Shop Domain"
            placeholder="your-store.myshopify.com"
            {...register("shopDomain", { required: "Shop domain is required" })}
            error={!!errors.shopDomain}
            helperText={errors.shopDomain?.message}
          />
        </Box>

        <Box display="flex" flexDirection="column" gap={2}>
          <Input
            label="Access Token"
            type="password"
            placeholder={config ? "••••••••" : "shpat_xxxxx"}
            {...register("accessToken", {
              required: !config ? "Access token is required" : false,
            })}
            error={!!errors.accessToken}
            helperText={
              errors.accessToken?.message ||
              (config ? "Leave empty to keep current token" : undefined)
            }
          />
        </Box>

        <Box display="flex" flexDirection="column" gap={2}>
          <Input
            label="API Version"
            placeholder="2024-10"
            {...register("apiVersion")}
          />
        </Box>

        <Box display="flex" gap={2}>
          <Button
            type="submit"
            disabled={!isDirty || saveConfigMutation.isLoading}
          >
            {saveConfigMutation.isLoading ? "Saving..." : "Save Configuration"}
          </Button>

          {config && (
            <Button
              variant="secondary"
              onClick={handleDisconnect}
              disabled={deleteConfigMutation.isLoading}
            >
              {deleteConfigMutation.isLoading ? "Disconnecting..." : "Disconnect"}
            </Button>
          )}
        </Box>
      </Box>

      {config?.isConfigured && (
        <Box
          display="flex"
          flexDirection="column"
          gap={4}
          borderTopStyle="solid"
          borderTopWidth={1}
          borderColor="default1"
          paddingTop={6}
        >
          <Text as="h2" size={5} fontWeight="medium">
            Sync Operations
          </Text>

          <Box display="flex" gap={4}>
            <Button
              as="a"
              href="/import"
              variant="secondary"
            >
              Import from Shopify
            </Button>

            <Button
              as="a"
              href="/export"
              variant="secondary"
            >
              Export to Shopify
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default IndexPage;
