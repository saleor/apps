import { NextPage } from "next";
import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { useRouter } from "next/router";
import React, { FormEventHandler, useEffect } from "react";
import { useIsMounted } from "usehooks-ts";
import Image from "next/image";
import SaleorLogoImage from "../assets/saleor-logo.svg";
import SaleorLogoImageDark from "../assets/saleor-logo-dark.svg";
import { InputAdornment, LinearProgress, TextField, Typography } from "@material-ui/core";
import { Button, makeStyles, useTheme } from "@saleor/macaw-ui";
import { isInIframe } from "@saleor/apps-shared";

const useStyles = makeStyles({
  root: {
    maxWidth: 960,
    margin: "50px auto",
  },
  headline: {
    marginTop: 70,
    lineHeight: 1.5,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "50% 50%",
    gap: 116,
    marginTop: 48,
  },
  form: {
    marginTop: 24,
  },
  submitButton: {
    marginTop: 12,
  },
  buttons: {
    marginTop: 24,
    "& > *": {
      marginBottom: 12,
    },
  },
});

const Input = () => {
  return (
    <TextField
      label="Your Saleor URL"
      fullWidth
      name="saleor-url"
      InputProps={{
        endAdornment: <InputAdornment position="end">.saleor.cloud</InputAdornment>,
      }}
    />
  );
};

/**
 * Common landing page in case of app being open outside the Dashboard.
 * Allows quick installation with Saleor env input
 *
 * Can be safely removed
 */
const IndexPage: NextPage = () => {
  const styles = useStyles();
  const { appBridgeState } = useAppBridge();
  const isMounted = useIsMounted();
  const { replace } = useRouter();
  const { themeType } = useTheme();

  const onFormSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    const appOrigin = window.location.origin;
    const appManifestUrl = new URL("api/manifest", appOrigin);
    const saleorUrlSlug = new FormData(e.currentTarget).get("saleor-url") as string;
    const saleorUrl = new URL("https://" + saleorUrlSlug.replace("https://", "") + ".saleor.cloud");

    const installationUrl = new URL(
      `dashboard/apps/install?manifestUrl=${appManifestUrl}`,
      saleorUrl
    ).href;

    window.location.href = installationUrl;
  };

  useEffect(() => {
    if (isMounted() && appBridgeState?.ready) {
      replace("/configuration");
    }
  }, [isMounted, appBridgeState?.ready]);

  /**
   * TODO Check also some timeout and show error if appBridge never handshakes
   */
  if (isInIframe()) {
    return <LinearProgress />;
  }

  return (
    <div className={styles.root}>
      <Image
        alt="Saleor logo"
        width={200}
        src={themeType === "light" ? SaleorLogoImage : SaleorLogoImageDark}
      />
      <Typography className={styles.headline} variant="h1">
        The Slack App has to be <br />
        launched in the Saleor Dashboard
      </Typography>
      <div className={styles.grid}>
        <div>
          <Typography variant="h3">
            Provide you Saleor URL
            <br /> to quickly install the app
          </Typography>
          <form onSubmit={onFormSubmit} className={styles.form}>
            <Input />
            <Button type="submit" className={styles.submitButton} fullWidth variant="primary">
              {" "}
              Submit and start installation
            </Button>
          </form>
        </div>
        <div>
          <Typography variant="h3">
            Or check the instructions
            <br /> and see how to install the app
          </Typography>
          <div className={styles.buttons}>
            <Button variant="secondary" fullWidth>
              Open repository
            </Button>
            <Button variant="secondary" fullWidth>
              See Saleor Docs
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndexPage;
