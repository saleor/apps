import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { Box } from "@saleor/macaw-ui";
import React from "react";

import { LogsBrowser } from "@/modules/client-logs/ui/logs-browser";
import { AppBreadcrumbs } from "@/modules/ui/app-breadcrumbs";

import { Section } from "../modules/ui/app-section";

const Header = () => {
  return <Section.Header>Check App logs (up to last 100)</Section.Header>;
};

const ConfigurationPage = () => {
  const { appBridgeState } = useAppBridge();

  if (!appBridgeState) {
    return null;
  }

  return (
    <Box display="flex" gap={8} flexDirection="column">
      <AppBreadcrumbs
        breadcrumbs={[
          {
            href: "/configuration",
            label: "Configuration",
          },
          {
            href: "/logs",
            label: "Logs",
          },
        ]}
      />
      <Header />
      <LogsBrowser />
    </Box>
  );
};

export default ConfigurationPage;
