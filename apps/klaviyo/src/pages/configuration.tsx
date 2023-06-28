import { useAppBridge, withAuthorization } from "@saleor/app-sdk/app-bridge";
import { SALEOR_API_URL_HEADER, SALEOR_AUTHORIZATION_BEARER_HEADER } from "@saleor/app-sdk/const";

import { ChangeEvent, SyntheticEvent, useEffect, useState } from "react";

import { useAppApi } from "../hooks/useAppApi";
import { AppColumnsLayout } from "../lib/ui/app-columns-layout";
import { useDashboardNotification } from "@saleor/apps-shared";
import { Box, BoxProps, Text, Input, Button } from "@saleor/macaw-ui/next";

interface ConfigurationField {
  key: string;
  value: string;
}

function Section(props: BoxProps) {
  return <Box padding={4} {...props} />;
}

function Instructions() {
  const { appBridge } = useAppBridge();

  const openExternalUrl = (url: string) => {
    // eslint-disable-next-line
    appBridge?.dispatch({
      type: "redirect",
      payload: {
        newContext: true,
        actionId: "redirect_from_klaviyo_app",
        to: url,
      },
    });
  };

  return (
    <Section>
      <Text as={"h3"} variant="heading">
        How to set up
      </Text>
      <Text as="p">App will send events as Klaviyo metrics each time Saleor Event occurs.</Text>
      <Text as="p">
        When first metric is sent, it should be available in Klaviyo to build on top of.
      </Text>
      <Text as="p">
        Metric name can be customized, PUBLIC_TOKEN must be provided to enable the app.
      </Text>
      <Text as={"h3"} variant="heading">
        Useful links
      </Text>
      <ul>
        <li>
          <a
            onClick={(e) => {
              e.preventDefault();

              openExternalUrl("https://github.com/saleor/saleor-app-klaviyo");
            }}
            href="https://github.com/saleor/saleor-app-klaviyo"
          >
            Visit repository & readme
          </a>
        </li>
      </ul>
      <Text as={"h3"} variant="heading">
        How to configure
      </Text>
      <ul>
        <li>
          <a
            onClick={(e) => {
              e.preventDefault();

              openExternalUrl(
                "https://help.klaviyo.com/hc/en-us/articles/115005062267-How-to-Manage-Your-Account-s-API-Keys"
              );
            }}
            href="https://help.klaviyo.com/hc/en-us/articles/115005062267-How-to-Manage-Your-Account-s-API-Keys"
          >
            Read about public tokens
          </a>
        </li>
        <li>
          <a
            onClick={(e) => {
              e.preventDefault();

              openExternalUrl("https://www.klaviyo.com/account#api-keys-tab");
            }}
            href="https://www.klaviyo.com/account#api-keys-tab"
          >
            Get public token here
          </a>
        </li>
        <li>
          <a
            onClick={(e) => {
              e.preventDefault();

              openExternalUrl(
                "https://help.klaviyo.com/hc/en-us/articles/115005076787-Guide-to-Managing-Your-Metrics"
              );
            }}
            href="https://help.klaviyo.com/hc/en-us/articles/115005076787-Guide-to-Managing-Your-Metrics"
          >
            Read about metrics
          </a>
        </li>
      </ul>
    </Section>
  );
}

function Configuration() {
  const { appBridgeState } = useAppBridge();
  const { notifySuccess, notifyError } = useDashboardNotification();
  const [configuration, setConfiguration] = useState<ConfigurationField[]>();

  const { data: configurationData, error } = useAppApi({
    url: "/api/configuration",
  });

  useEffect(() => {
    if (configurationData && !configuration) {
      setConfiguration(configurationData.data);
    }
  }, [configurationData, configuration]);

  /**
   * TODO Rewrite to tRPC
   */
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
        if (response.status !== 200) {
          throw new Error("Error saving configuration data");
        }

        notifySuccess("Success", "Configuration updated successfully");
      })
      .catch(async () => {
        await notifyError(
          "Configuration update failed. Ensure fields are filled correctly and you have MANAGE_APPS permission"
        );
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
    return (
      <div>
        <h1>⚠️ Can&apos;t connect with the App API</h1>
        You may see this error because:
        <ul>
          <li>Internet connection has been lost</li>
          <li>
            Application installation process is still in progress. If you use Vercel, you may need
            to wait for redeployment of the app - try again in a minute.
          </li>
          <li>
            Application is misconfigured. If you would like to know more how auth configuration is
            kept,{" "}
            <a
              href="https://github.com/saleor/saleor-app-sdk/blob/main/docs/apl.md"
              target="_blank"
              rel="noreferrer"
            >
              go to APL documentation
            </a>
            .
          </li>
        </ul>
      </div>
    );
  }

  if (configuration === undefined) {
    return <p>Loading...</p>;
  }

  return (
    <AppColumnsLayout>
      <div />
      <Section>
        <Text variant={"heading"} marginBottom={4} as={"h2"}>
          Klaviyo configuration
        </Text>
        <Box as={"form"} display={"grid"} gap={4} gridAutoFlow={"row"} onSubmit={handleSubmit}>
          {configuration!.map(({ key, value }) => (
            <div key={key}>
              <Input label={key} name={key} onChange={onChange} value={value} />
            </div>
          ))}
          <div>
            <Button type="submit" variant="primary">
              Save
            </Button>
          </div>
        </Box>
      </Section>
      <Instructions />
    </AppColumnsLayout>
  );
}

export default Configuration;
