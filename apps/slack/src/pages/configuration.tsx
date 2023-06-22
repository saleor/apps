import { useAppBridge, withAuthorization } from "@saleor/app-sdk/app-bridge";
import { SALEOR_API_URL_HEADER, SALEOR_AUTHORIZATION_BEARER_HEADER } from "@saleor/app-sdk/const";
import { ChangeEvent, ReactElement, SyntheticEvent, useEffect, useState } from "react";

import { ConfigurationError } from "../components/ConfigurationError/ConfigurationError";
import { useAppApi } from "../hooks/useAppApi";
import { AppColumnsLayout } from "../components/AppColumnsLayout/AppColumnsLayout";
import { useDashboardNotification } from "@saleor/apps-shared";

import { Input, Text, Box, Button } from "@saleor/macaw-ui/next";
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
          <Input label={key} name={key} onChange={onChange} value={value} />
        </div>
      ))}
      <p>
        This webhook will be called when new order is created and `order_created` event is
        triggered.
      </p>
      <div>
        <Button type="submit" variant="primary">
          Save
        </Button>
      </div>
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
      <Text>How to configure</Text>
      <ul>
        <li>
          <a
            onClick={(e) => {
              e.preventDefault();
              openExternalUrl(slackUrl.href);
            }}
            href={slackUrl.href}
          >
            Install Slack application
          </a>
        </li>
        <li>
          Copy incoming Webhook URL from Slack app configuration and paste it below into
          `WEBHOOK_URL` field
        </li>
        <li>Save configuration</li>
      </ul>
      <Text>Useful links</Text>
      <ul>
        <li>
          <a
            onClick={(e) => {
              e.preventDefault();
              openExternalUrl("https://github.com/saleor/saleor-app-slack");
            }}
            href="https://github.com/saleor/saleor-app-slack"
          >
            Visit repository & readme
          </a>
        </li>
        <li>
          <a
            onClick={(e) => {
              e.preventDefault();
              openExternalUrl("https://api.slack.com/messaging/webhooks");
            }}
            href="https://api.slack.com/messaging/webhooks"
          >
            Read about Slack apps that use incoming webhooks
          </a>
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
    <div />
    <Box>
      <Text>Configuration</Text>
      <Box>{page}</Box>
    </Box>
    <Box marginBottom={4}>
      <Text>Instructions</Text>
      <Box>
        <Instructions />
      </Box>
    </Box>
  </AppColumnsLayout>
);

export default ConfigurationWithAuth;
