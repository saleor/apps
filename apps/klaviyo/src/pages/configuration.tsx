import { useAppBridge, useAuthenticatedFetch } from "@saleor/app-sdk/app-bridge";
import { SALEOR_API_URL_HEADER, SALEOR_AUTHORIZATION_BEARER_HEADER } from "@saleor/app-sdk/const";

import { ChangeEvent, SyntheticEvent, useEffect, useState } from "react";

import { useDashboardNotification } from "@saleor/apps-shared";
import { Breadcrumbs, ButtonsBox, Layout, SkeletonLayout, TextLink } from "@saleor/apps-ui";
import { Box, Button, Input, Text } from "@saleor/macaw-ui";
import { useAppApi } from "../hooks/useAppApi";

interface ConfigurationField {
  key: string;
  value: string;
}

function Instructions() {
  return (
    <Box>
      <Text as={"h3"} variant="heading" marginY={4}>
        How to set up
      </Text>
      <Text as="p" marginBottom={2}>
        App will send events as Klaviyo metrics each time Saleor Event occurs.
      </Text>
      <Text as="p" marginBottom={2}>
        When first metric is sent, it should be available in Klaviyo to build on top of.
      </Text>
      <Text as="p" marginBottom={4}>
        Metric name can be customized, PUBLIC_TOKEN must be provided to enable the app.
      </Text>
      <Text as={"h3"} variant="heading">
        Useful links
      </Text>
      <ul>
        <li>
          <TextLink href="https://github.com/saleor/saleor-app-klaviyo" newTab>
            Visit repository & readme
          </TextLink>
        </li>
      </ul>
      <Text as={"h3"} variant="heading">
        How to configure
      </Text>
      <ul>
        <li>
          <TextLink
            href="https://help.klaviyo.com/hc/en-us/articles/115005062267-How-to-Manage-Your-Account-s-API-Keys"
            newTab
          >
            Read about public tokens
          </TextLink>
        </li>
        <li>
          <TextLink href="https://www.klaviyo.com/account#api-keys-tab" newTab>
            Get public token here
          </TextLink>
        </li>
        <li>
          <TextLink
            href="https://help.klaviyo.com/hc/en-us/articles/115005076787-Guide-to-Managing-Your-Metrics"
            newTab
          >
            Read about metrics
          </TextLink>
        </li>
      </ul>
    </Box>
  );
}

function Configuration() {
  const { appBridgeState } = useAppBridge();
  const { notifySuccess, notifyError } = useDashboardNotification();
  const [configuration, setConfiguration] = useState<ConfigurationField[]>();
  const authenticatedFetch = useAuthenticatedFetch() as typeof window.fetch;

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

    authenticatedFetch("/api/configuration", {
      method: "POST",
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
          "Configuration update failed. Ensure fields are filled correctly and you have MANAGE_APPS permission",
        );
      });
  };

  const onChange = (event: ChangeEvent) => {
    const { name, value } = event.target as HTMLInputElement;

    setConfiguration((prev) =>
      prev!.map((prevField) => (prevField.key === name ? { ...prevField, value } : prevField)),
    );
  };

  if (!appBridgeState) {
    return null;
  }

  if (appBridgeState.user?.permissions.includes("MANAGE_APPS") === false) {
    return <Text>You do not have permission to access this page.</Text>;
  }

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
    return <SkeletonLayout.Section />;
  }

  return (
    <Box>
      <Breadcrumbs marginBottom={10}>
        <Breadcrumbs.Item>Configuration</Breadcrumbs.Item>
      </Breadcrumbs>
      <Layout.AppSection heading="Set up integration" sideContent={<Instructions />}>
        <Layout.AppSectionCard
          as={"form"}
          onSubmit={handleSubmit}
          footer={
            <ButtonsBox>
              <Button type="submit" variant="primary">
                Save
              </Button>
            </ButtonsBox>
          }
        >
          <Box display={"grid"} gap={4} gridAutoFlow={"row"}>
            {configuration!.map(({ key, value }) => (
              <div key={key}>
                <Input label={key} name={key} onChange={onChange} value={value} />
              </div>
            ))}
          </Box>
        </Layout.AppSectionCard>
      </Layout.AppSection>
    </Box>
  );
}

export default Configuration;
