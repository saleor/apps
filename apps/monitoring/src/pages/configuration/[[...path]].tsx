import { NextPage } from "next";
import React, { useEffect } from "react";
import { NoProvidersConfigured } from "../../ui/no-providers-configured";
import { useRouter } from "next/router";
import { DatadogConfig } from "../../ui/datadog/datadog-config";
import { DatadogSite, useConfigQuery } from "../../../generated/graphql";
import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { DATADOG_SITES_LINKS } from "../../datadog-urls";
import { Box, Button, Text } from "@saleor/macaw-ui/next";
import { Breadcrumbs, TextLink } from "@saleor/apps-ui";

const useActiveProvider = () => {
  const router = useRouter();

  const selectedProvider = router.query?.path && router.query.path[0];

  return selectedProvider ?? null;
};

const ConfigurationPage = () => {
  const [configuration, fetchConfiguration] = useConfigQuery();
  const { appBridge } = useAppBridge();

  const datadogCredentials = configuration.data?.integrations.datadog?.credentials;
  const datadogError = configuration.data?.integrations.datadog?.error;

  const { push } = useRouter();

  useEffect(() => {
    fetchConfiguration();
  }, [fetchConfiguration]);

  const selectedProvider = useActiveProvider();

  if (configuration.fetching && !configuration.data) {
    return <Text>Loading...</Text>;
  }

  if (selectedProvider === "datadog") {
    return <DatadogConfig />;
  }

  if (!configuration.data?.integrations.datadog) {
    return <NoProvidersConfigured />;
  }

  // when configured and everything is fine
  if (datadogCredentials && !datadogError) {
    const site = configuration.data?.integrations.datadog?.credentials.site ?? DatadogSite.Us1;

    return (
      <Box display={"flex"} gap={4} flexDirection={"column"}>
        <Text as={"h1"} variant="heading">
          App configured
        </Text>
        <Text as={"p"}>
          Visit{" "}
          <TextLink newTab href={DATADOG_SITES_LINKS[site] ?? "https://app.datadoghq.com/"}>
            Datadog
          </TextLink>{" "}
          to access your logs
        </Text>
        <Button
          onClick={() => {
            push("/configuration/datadog");
          }}
        >
          Edit configuration
        </Button>
      </Box>
    );
  }

  if (datadogError) {
    return (
      <Box>
        <Text variant="heading" as={"h1"}>
          Configuration Error
        </Text>
        <Text color={"textCriticalDefault"}>{datadogError}</Text>
        <Button
          marginTop={8}
          onClick={() => {
            push("/configuration/datadog");
          }}
        >
          Edit configuration
        </Button>
      </Box>
    );
  }

  return null;
};

export default ConfigurationPage;
