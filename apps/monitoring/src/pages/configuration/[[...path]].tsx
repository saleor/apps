import { NextPage } from "next";
import { AppColumnsLayout } from "../../ui/app-columns-layout";
import React, { useEffect } from "react";
import { IntegrationsList } from "../../ui/providers-list";
import { NoProvidersConfigured } from "../../ui/no-providers-configured";
import { useRouter } from "next/router";
import { DatadogConfig } from "../../ui/datadog/datadog-config";
import { DatadogSite, useConfigQuery } from "../../../generated/graphql";
import { LinearProgress, Link, Typography } from "@material-ui/core";
import { Section } from "../../ui/sections";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Done, Error } from "@material-ui/icons";
import { DATADOG_SITES_LINKS } from "../../datadog-urls";

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
    return <LinearProgress />;
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
      <Section>
        <Typography paragraph variant="h3">
          <Done style={{ verticalAlign: "middle", marginRight: 10 }} />
          App configured
        </Typography>
        <Typography paragraph>
          Visit{" "}
          <Link
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
          </Link>{" "}
          to access your logs
        </Typography>
      </Section>
    );
  }

  if (datadogError) {
    return (
      <Section>
        <Typography paragraph variant="h3">
          <Error style={{ verticalAlign: "middle", marginRight: 10 }} />
          Configuration Error
        </Typography>
        <Typography>{datadogError}</Typography>
      </Section>
    );
  }

  return null;
};

const ConfigurationPage: NextPage = () => {
  const selectedProvider = useActiveProvider();

  return (
    <AppColumnsLayout>
      <IntegrationsList activeProvider={selectedProvider} />
      <Content />
    </AppColumnsLayout>
  );
};

export default ConfigurationPage;
