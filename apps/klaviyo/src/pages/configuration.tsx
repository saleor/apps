import { Link, List, ListItem, Paper, PaperProps, TextField, Typography } from "@material-ui/core";
import Skeleton from "@material-ui/lab/Skeleton";
import { useAppBridge, withAuthorization } from "@saleor/app-sdk/app-bridge";
import { SALEOR_API_URL_HEADER, SALEOR_AUTHORIZATION_BEARER_HEADER } from "@saleor/app-sdk/const";

import { ConfirmButton, ConfirmButtonTransitionState, makeStyles } from "@saleor/macaw-ui";
import { ChangeEvent, SyntheticEvent, useEffect, useState } from "react";

import { AccessWarning } from "../components/AccessWarning/AccessWarning";
import { useAppApi } from "../hooks/useAppApi";
import { AppColumnsLayout } from "../lib/ui/app-columns-layout";
import { useDashboardNotification } from "@saleor/apps-shared";

interface ConfigurationField {
  key: string;
  value: string;
}

const useStyles = makeStyles((theme) => ({
  confirmButton: {
    marginLeft: "auto",
  },
  fieldContainer: {
    marginBottom: theme.spacing(2),
  },
}));

function Section(props: PaperProps) {
  return <Paper style={{ padding: 24 }} elevation={0} {...props} />;
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
      <Typography paragraph variant="h3">
        How to set up
      </Typography>
      <Typography paragraph>
        App will send events as Klaviyo metrics each time Saleor Event occurs.
      </Typography>
      <Typography paragraph>
        When first metric is sent, it should be available in Klaviyo to build on top of.
      </Typography>
      <Typography paragraph>
        Metric name can be customized, PUBLIC_TOKEN must be provided to enable the app.
      </Typography>
      <Typography variant="h3">Useful links</Typography>
      <List>
        <ListItem>
          <Link
            onClick={(e) => {
              e.preventDefault();

              openExternalUrl("https://github.com/saleor/saleor-app-klaviyo");
            }}
            href="https://github.com/saleor/saleor-app-klaviyo"
          >
            Visit repository & readme
          </Link>
        </ListItem>
      </List>
      <Typography variant="h3">How to configure</Typography>
      <List>
        <ListItem>
          <Link
            onClick={(e) => {
              e.preventDefault();

              openExternalUrl(
                "https://help.klaviyo.com/hc/en-us/articles/115005062267-How-to-Manage-Your-Account-s-API-Keys"
              );
            }}
            href="https://help.klaviyo.com/hc/en-us/articles/115005062267-How-to-Manage-Your-Account-s-API-Keys"
          >
            Read about public tokens
          </Link>
        </ListItem>
        <ListItem>
          <Link
            onClick={(e) => {
              e.preventDefault();

              openExternalUrl("https://www.klaviyo.com/account#api-keys-tab");
            }}
            href="https://www.klaviyo.com/account#api-keys-tab"
          >
            Get public token here
          </Link>
        </ListItem>
        <ListItem>
          <Link
            onClick={(e) => {
              e.preventDefault();

              openExternalUrl(
                "https://help.klaviyo.com/hc/en-us/articles/115005076787-Guide-to-Managing-Your-Metrics"
              );
            }}
            href="https://help.klaviyo.com/hc/en-us/articles/115005076787-Guide-to-Managing-Your-Metrics"
          >
            Read about metrics
          </Link>
        </ListItem>
      </List>
    </Section>
  );
}

function Configuration() {
  const { appBridgeState } = useAppBridge();
  const classes = useStyles();
  const { notifySuccess, notifyError } = useDashboardNotification();
  const [configuration, setConfiguration] = useState<ConfigurationField[]>();
  const [transitionState, setTransitionState] = useState<ConfirmButtonTransitionState>("default");

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
    setTransitionState("loading");

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
        setTransitionState("success");

        notifySuccess("Success", "Configuration updated successfully");
      })
      .catch(async () => {
        setTransitionState("error");
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
    return <Skeleton />;
  }

  return (
    <AppColumnsLayout>
      <div />
      <Section>
        <form onSubmit={handleSubmit}>
          {configuration!.map(({ key, value }) => (
            <div key={key} className={classes.fieldContainer}>
              <TextField label={key} name={key} fullWidth onChange={onChange} value={value} />
            </div>
          ))}
          <div>
            <ConfirmButton
              type="submit"
              variant="primary"
              transitionState={transitionState}
              labels={{
                confirm: "Save",
                error: "Error",
              }}
              className={classes.confirmButton}
            />
          </div>
        </form>
      </Section>
      <Instructions />
    </AppColumnsLayout>
  );
}

export default withAuthorization({
  notIframe: <AccessWarning cause="not_in_iframe" />,
  unmounted: null,
  noDashboardToken: <AccessWarning cause="missing_access_token" />,
  dashboardTokenInvalid: <AccessWarning cause="invalid_access_token" />,
})(Configuration);
