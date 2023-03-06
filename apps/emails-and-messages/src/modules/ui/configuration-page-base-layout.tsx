import React, { PropsWithChildren } from "react";
import { Button, makeStyles, PageTab, PageTabs } from "@saleor/macaw-ui";
import { GitHub, OfflineBoltOutlined } from "@material-ui/icons";
import { actions, useAppBridge } from "@saleor/app-sdk/app-bridge";
import { MainBar } from "../../modules/ui/main-bar";
import { appBrandColor, appName } from "../../const";
import Image from "next/image";
import appIcon from "../../public/notification-hub.svg";
import { useRouter } from "next/router";

const useStyles = makeStyles({
  buttonsGrid: { display: "flex", gap: 10 },
  topBar: {
    marginBottom: 32,
  },
  appIconContainer: {
    background: appBrandColor,
    padding: 10,
    borderRadius: "50%",
    width: 50,
    height: 50,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "#fff",
  },
});

const AppIcon = () => {
  const styles = useStyles();

  return (
    <div className={styles.appIconContainer}>
      <Image width={30} height={30} alt="icon" src={appIcon} />
    </div>
  );
};

type Props = PropsWithChildren<{}>;

export const ConfigurationPageBaseLayout = ({ children }: Props) => {
  const styles = useStyles();
  const { appBridge } = useAppBridge();

  const openInNewTab = (url: string) => {
    appBridge?.dispatch(
      actions.Redirect({
        to: url,
        newContext: true,
      })
    );
  };

  const router = useRouter();
  const tabs = [
    {
      key: "channels",
      label: "Channels",
      url: "/configuration/channels",
    },
    { key: "mjml", label: "MJML", url: "/configuration/mjml" },
    {
      key: "sendgrid",
      label: "Sendgrid (Coming soon!)",
      url: "/configuration/sendgrid",
      disabled: true,
    },
  ];

  const activePath = tabs.find((tab) => router.pathname.startsWith(tab.url))?.key;

  const navigateToTab = (value: string) => {
    const redirectionUrl = tabs.find((tab) => tab.key === value)?.url;
    if (redirectionUrl) {
      router.push(redirectionUrl);
    }
  };
  return (
    <div>
      <MainBar
        icon={<AppIcon />}
        className={styles.topBar}
        name={appName}
        author="By Saleor Commerce"
        rightColumnContent={
          <div className={styles.buttonsGrid}>
            <Button
              variant="secondary"
              startIcon={<GitHub />}
              onClick={() => {
                openInNewTab("https://github.com/saleor/saleor-emails-and-messages");
              }}
            >
              Repository
            </Button>
            <Button
              startIcon={<OfflineBoltOutlined />}
              variant="secondary"
              onClick={() => {
                openInNewTab("https://github.com/saleor/apps/discussions");
              }}
            >
              Request a feature
            </Button>
          </div>
        }
      />
      <PageTabs
        value={activePath}
        onChange={navigateToTab}
        style={{ maxWidth: 1180, margin: "0 auto" }}
      >
        {tabs.map((tab) => (
          <PageTab key={tab.key} value={tab.key} label={tab.label} disabled={tab.disabled} />
        ))}
      </PageTabs>
      {children}
    </div>
  );
};
