import { NextPage } from "next";
import { AppColumnsLayout } from "../../ui/app-columns-layout";
import React, { useEffect } from "react";
import { NoProvidersConfigured } from "../../ui/no-providers-configured";
import { useRouter } from "next/router";
import { DatadogConfig } from "../../ui/datadog/datadog-config";
import { DatadogSite, useConfigQuery } from "../../../generated/graphql";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { DATADOG_SITES_LINKS } from "../../datadog-urls";
import { Text, Box } from "@saleor/macaw-ui/next";

const useActiveProvider = () => {
  const router = useRouter();

  const selectedProvider = router.query?.path && router.query.path[0];

  return selectedProvider ?? null;
};

const Content = () => {
  const [configuration, fetchConfiguration] = useConfigQuery();
  const { appBridge } = useAppBridge();

  const datadogCredentials = configuration.data?.integrations.datadog?.credentials;
  const datadogError = configuration.data?.integrations.datadog?.error;

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
      <Box>
        <Text as={"p"} variant="heading">
          App configured
        </Text>
        <Text as={"p"}>
          Visit{" "}
          <a
            href="https://app.datadoghq.com/"
            onClick={(e) => {
              e.preventDefault();
              appBridge?.dispatch(
                actions.Redirect({
                  to: DATADOG_SITES_LINKS[site],
                  newContext: true,
                })
              );
            }}
          >
            Datadog
          </a>{" "}
          to access your logs
        </Text>
      </Box>
    );
  }

  if (datadogError) {
    return (
      <Box>
        <Text variant="heading">Configuration Error</Text>
        <Text>{datadogError}</Text>
      </Box>
    );
  }

  return null;
};

const ConfigurationPage: NextPage = () => {
  return <Content />;
};

export default ConfigurationPage;
