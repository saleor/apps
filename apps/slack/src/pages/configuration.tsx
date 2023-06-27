import { useAppBridge, withAuthorization } from "@saleor/app-sdk/app-bridge";
import { SALEOR_API_URL_HEADER, SALEOR_AUTHORIZATION_BEARER_HEADER } from "@saleor/app-sdk/const";
import { ChangeEvent, ReactElement, SyntheticEvent, useEffect, useState } from "react";

import { ConfigurationError } from "../components/ConfigurationError/ConfigurationError";
import { useAppApi } from "../hooks/useAppApi";
import { AppColumnsLayout } from "../components/AppColumnsLayout/AppColumnsLayout";
import { useDashboardNotification } from "@saleor/apps-shared";

import { Input, Text, Box, Button } from "@saleor/macaw-ui/next";

import { TextLink } from "@saleor/apps-ui";
import { AccessWarning } from "../components/AccessWarning/AccessWarning";

interface ConfigurationField {
  key: string;
  value: string;
}

function Configuration() {
  const { appBridgeState } = useAppBridge();
  const { notifyError, notifySuccess } = useDashboardNotification();
  const [configuration, setConfiguration] = useState<ConfigurationField[]>();

  const { data: configurationData, error } = useAppApi<{ data: ConfigurationField[] }>({
    url: "/api/configuration",
  });

  useEffect(() => {
    if (configurationData && !configuration) {
      setConfiguration(configurationData.data);
    }
  }, [configurationData, configuration]);

  const handleSubmit = (event: SyntheticEvent) => {
    event.preventDefault();

    fetch("/api/configuration", {
      method: "POST",
      headers: [
        ["content-type", "application/json"],
        [SALEOR_API_URL_HEADER, appBridgeState?.saleorApiUrl!],
        [SALEOR_AUTHORIZATION_BEARER_HEADER, appBridgeState?.token!],
      ],
      body: JSON.stringify({ data: configuration }),
    })
      .then(async (response) => {
        notifySuccess("Success", "Configuration updated successfully");
      })
      .catch(async () => {
        await notifyError("Configuration update failed");
      });
  };

  const onChange = (event: ChangeEvent) => {
    const { name, value } = event.target as HTMLInputElement;

    setConfiguration((prev) =>
      prev!.map((prevField) => (prevField.key === name ? { ...prevField, value } : prevField))
    );
  };

  if (error) {
    console.error("Can't establish connection with the App API: ", error);
    return <ConfigurationError />;
  }

  if (configuration === undefined) {
    return <Text>Loading</Text>;
  }

  return (
    <form onSubmit={handleSubmit}>
      {configuration!.map(({ key, value }) => (
        <div key={key}>
          <Input
            label={key}
            name={key}
            onChange={onChange}
            value={value}
            helperText={
              "This webhook will be called when new order is created and `order_created` event is triggered."
            }
          />
        </div>
      ))}
      <Box marginTop={4}>
        <Button type="submit" variant="primary">
          Save
        </Button>
      </Box>
    </form>
  );
}

function Instructions() {
  const { appBridge } = useAppBridge();

  const { data } = useAppApi({
    url: "/api/slack-app-manifest",
  });

  const slackUrl = new URL("https://api.slack.com/apps");

  slackUrl.searchParams.append("new_app", "1");
  slackUrl.searchParams.append("manifest_json", JSON.stringify(data));

  const openExternalUrl = (to: string) => {
    appBridge?.dispatch({
      type: "redirect",
      payload: {
        newContext: true,
        actionId: "redirect_from_slack_app",
        to,
      },
    });
  };

  return (
    <>
      <Text variant={"heading"}>How to configure</Text>
      <Box display={"flex"} gap={2} as={"ul"} flexDirection={"column"}>
        <li>
          <TextLink href={slackUrl.href}>1. Install Slack application</TextLink>
        </li>
        <li>
          <Text>
            2. Copy incoming Webhook URL from Slack app configuration and paste it below into{" "}
            <Text variant={"bodyStrong"}>WEBHOOK_URL</Text> field
          </Text>
        </li>
        <li>
          <Text>3. Save configuration</Text>
        </li>
      </Box>
      <Text variant={"heading"}>Useful links</Text>
      <ul>
        <li>
          <TextLink newTab href={"https://api.slack.com/messaging/webhooks"}>
            Read about Slack apps that use incoming webhooks
          </TextLink>
        </li>
      </ul>
    </>
  );
}

const ConfigurationWithAuth = withAuthorization({
  notIframe: <AccessWarning cause="not_in_iframe" />,
  unmounted: null,
  noDashboardToken: <AccessWarning cause="missing_access_token" />,
  dashboardTokenInvalid: <AccessWarning cause="invalid_access_token" />,
})(Configuration);

ConfigurationWithAuth.getLayout = (page: ReactElement) => (
  <AppColumnsLayout>
    <Box marginBottom={4}>
      <Instructions />
    </Box>
    <Box
      borderColor={"neutralHighlight"}
      borderStyle={"solid"}
      borderWidth={1}
      padding={4}
      borderRadius={4}
    >
      <Text as={"h2"} marginBottom={4} variant={"heading"}>
        Configuration
      </Text>
      <Box>{page}</Box>
    </Box>
  </AppColumnsLayout>
);

export default ConfigurationWithAuth;
