import { useAppBridge, useAuthenticatedFetch } from "@saleor/app-sdk/app-bridge";
import { useDashboardNotification } from "@saleor/apps-shared/use-dashboard-notification";
import { TextLink } from "@saleor/apps-ui";
import { Callout, type ConfirmButtonTransitionState } from "@saleor/apps-ui-next";
import { Box, Text } from "@saleor/macaw-ui";
import { useEffect, useState } from "react";

import { useAppApi } from "../hooks/use-app-api";
import {
  type ConfigurationKey,
  type ConfigurationValues,
  ConfigurationView,
} from "../modules/configuration/configuration-view";

type ConfigurationField = { key: ConfigurationKey; value: string | undefined };

const toValues = (fields: ConfigurationField[]) =>
  Object.fromEntries(fields.map(({ key, value }) => [key, value ?? ""])) as ConfigurationValues;

const toFields = (values: ConfigurationValues) =>
  Object.entries(values).map(([key, value]) => ({ key, value }));

const ApiUnreachable = () => (
  <Callout type="error" title="Can't connect with the app API">
    <Box as="ul" margin={0} paddingLeft={4}>
      <li>
        <Text size={2}>The internet connection has been lost.</Text>
      </li>
      <li>
        <Text size={2}>
          The installation is still in progress. If you deploy on Vercel, wait for the redeployment
          and try again in a minute.
        </Text>
      </li>
      <li>
        <Text size={2}>
          The app is misconfigured. See how auth data is stored in the{" "}
          <TextLink
            href="https://docs.saleor.io/developer/extending/apps/developing-apps/app-sdk/apl"
            newTab
          >
            APL documentation
          </TextLink>
          .
        </Text>
      </li>
    </Box>
  </Callout>
);

function Configuration() {
  const { appBridgeState } = useAppBridge();
  const { notifySuccess, notifyError } = useDashboardNotification();
  const authenticatedFetch = useAuthenticatedFetch() as typeof window.fetch;
  const [values, setValues] = useState<ConfigurationValues>();
  const [saveState, setSaveState] = useState<ConfirmButtonTransitionState>("default");

  const { data, error } = useAppApi({ url: "/api/configuration" });

  useEffect(() => {
    if (data && !values) {
      setValues(toValues(data.data));
    }
  }, [data, values]);

  if (!appBridgeState) {
    return null;
  }

  const save = async (next: ConfigurationValues) => {
    setSaveState("loading");

    try {
      const response = await authenticatedFetch("/api/configuration", {
        method: "POST",
        body: JSON.stringify({ data: toFields(next) }),
      });
      const json = response.ok ? await response.json() : undefined;

      /* The handler answers 200 with `success: false` when writing the metadata fails. */
      if (!json?.success) {
        throw new Error("Error saving configuration data");
      }

      setValues(toValues(json.data));
      setSaveState("success");
      notifySuccess("Configuration saved");
    } catch {
      setSaveState("error");
      await notifyError(
        "Configuration update failed",
        "Ensure fields are filled correctly and you have the MANAGE_APPS permission.",
      );
    }
  };

  const fallback =
    appBridgeState.user?.permissions.includes("MANAGE_APPS") === false ? (
      <Callout type="error" title="You do not have permission to access this page">
        <Text size={2}>
          Ask a staff member with the MANAGE_APPS permission to configure Klaviyo.
        </Text>
      </Callout>
    ) : error ? (
      <ApiUnreachable />
    ) : undefined;

  return (
    <ConfigurationView
      values={values}
      fallback={fallback}
      saveState={saveState}
      onSave={(next) => void save(next)}
    />
  );
}

export default Configuration;
