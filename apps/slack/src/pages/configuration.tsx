import {
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  TextField,
  Typography,
} from "@material-ui/core";
import Skeleton from "@material-ui/lab/Skeleton";
import { AplReadyResult, VercelAPL } from "@saleor/app-sdk/APL";
import { useAppBridge, withAuthorization } from "@saleor/app-sdk/app-bridge";
import { SALEOR_API_URL_HEADER, SALEOR_AUTHORIZATION_BEARER_HEADER } from "@saleor/app-sdk/const";
import { ConfirmButton, ConfirmButtonTransitionState, makeStyles } from "@saleor/macaw-ui";
import { GetServerSideProps } from "next";
import { ChangeEvent, ReactElement, SyntheticEvent, useEffect, useState } from "react";

import AccessWarning from "../components/AccessWarning/AccessWarning";
import { ConfigurationError } from "../components/ConfigurationError/ConfigurationError";
import useAppApi from "../hooks/useAppApi";
import { saleorApp } from "../lib/saleor-app";
import useDashboardNotifier from "../utils/useDashboardNotifier";

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
  additionalInfo: {
    marginBottom: theme.spacing(3),
  },
}));

type PageProps = {
  isVercel: boolean;
  appReady: AplReadyResult;
};

export const getServerSideProps: GetServerSideProps<PageProps> = async () => {
  const isVercel = saleorApp.apl instanceof VercelAPL;
  const isAppReady = await saleorApp.isReady();

  return {
    props: {
      isVercel,
      appReady: isAppReady,
    },
  };
};

function Configuration({ isVercel, appReady }: PageProps) {
  const classes = useStyles();
  const { appBridgeState } = useAppBridge();
  const [notify] = useDashboardNotifier();
  const [configuration, setConfiguration] = useState<ConfigurationField[]>();
  const [transitionState, setTransitionState] = useState<ConfirmButtonTransitionState>("default");

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
        setTransitionState(response.status === 200 ? "success" : "error");
        await notify({
          status: "success",
          title: "Success",
          text: "Configuration updated successfully",
        });
      })
      .catch(async () => {
        setTransitionState("error");
        await notify({
          status: "error",
          title: "Configuration update failed",
        });
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
    return <ConfigurationError appReady={appReady} isVercel={isVercel} />;
  }

  if (configuration === undefined) {
    return <Skeleton />;
  }

  return (
    <form onSubmit={handleSubmit}>
      {configuration!.map(({ key, value }) => (
        <div key={key} className={classes.fieldContainer}>
          <TextField label={key} name={key} fullWidth onChange={onChange} value={value} />
        </div>
      ))}
      <p className={classes.additionalInfo}>
        This webhook will be called when new order is created and `order_created` event is
        triggered.
      </p>
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
      <Typography>How to configure</Typography>
      <List>
        <ListItem>
          <a
            onClick={(e) => {
              e.preventDefault();
              openExternalUrl(slackUrl.href);
            }}
            href={slackUrl.href}
          >
            Install Slack application
          </a>
        </ListItem>
        <ListItem>
          Copy incoming Webhook URL from Slack app configuration and paste it below into
          `WEBHOOK_URL` field
        </ListItem>
        <ListItem>Save configuration</ListItem>
      </List>
      <Typography>Useful links</Typography>
      <List>
        <ListItem>
          <a
            onClick={(e) => {
              e.preventDefault();
              openExternalUrl("https://github.com/saleor/saleor-app-slack");
            }}
            href="https://github.com/saleor/saleor-app-slack"
          >
            Visit repository & readme
          </a>
        </ListItem>
        <ListItem>
          <a
            onClick={(e) => {
              e.preventDefault();
              openExternalUrl("https://api.slack.com/messaging/webhooks");
            }}
            href="https://api.slack.com/messaging/webhooks"
          >
            Read about Slack apps that use incoming webhooks
          </a>
        </ListItem>
      </List>
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
  <div>
    <Card style={{ marginBottom: 40 }}>
      <CardHeader title="Instructions" />
      <CardContent>
        <Instructions />
      </CardContent>
    </Card>
    <Card>
      <CardHeader title="Configuration" />
      <CardContent>{page}</CardContent>
    </Card>
  </div>
);

export default ConfigurationWithAuth;
